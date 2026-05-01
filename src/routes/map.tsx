import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Zap, MapPin, Crosshair, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — Nudge" },
      { name: "description", content: "Live radar of nearby friends. Real geolocation, real proximity." },
    ],
  }),
  component: MapPage,
});

type Profile = { id: string; username: string; display_name: string; avatar_url: string | null };
type Loc = { user_id: string; lat: number; lng: number; updated_at: string };
type FriendLoc = { profile: Profile; loc: Loc; distKm: number };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function formatDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function MapPage() {
  const { user, profile } = useAuth();
  const [proximity, setProximity] = useState(5);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [locs, setLocs] = useState<Record<string, Loc>>({});
  const watchId = useRef<number | null>(null);

  // Load friends
  const loadFriends = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friend_requests")
      .select("sender_id, recipient_id, sender:profiles!friend_requests_sender_id_fkey(*), recipient:profiles!friend_requests_recipient_id_fkey(*)")
      .eq("status", "accepted")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
    const list: Profile[] = (data ?? []).map((r: any) => r.sender_id === user.id ? r.recipient : r.sender);
    setFriends(list.filter(Boolean));
  }, [user]);

  const loadLocations = useCallback(async () => {
    const { data } = await supabase.from("locations").select("*");
    const map: Record<string, Loc> = {};
    (data ?? []).forEach((l: Loc) => { map[l.user_id] = l; });
    setLocs(map);
  }, []);

  useEffect(() => {
    loadFriends();
    loadLocations();
    if (!user) return;
    const ch = supabase
      .channel("map-locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, loadLocations)
      .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, loadFriends)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadFriends, loadLocations]);

  // Geolocation
  function startTracking() {
    if (!("geolocation" in navigator)) return setGeoError("Geolocation not supported.");
    setGeoError(null);
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMyPos({ lat, lng });
        if (user) {
          await supabase.from("locations").upsert({
            user_id: user.id,
            lat, lng,
            accuracy: pos.coords.accuracy,
            updated_at: new Date().toISOString(),
          });
        }
      },
      (err) => setGeoError(err.message || "Location permission denied."),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }

  useEffect(() => () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); }, []);

  const friendLocs: FriendLoc[] = useMemo(() => {
    if (!myPos) return [];
    return friends
      .map((p) => {
        const loc = locs[p.id];
        if (!loc) return null;
        return { profile: p, loc, distKm: haversineKm(myPos, { lat: loc.lat, lng: loc.lng }) };
      })
      .filter((x): x is FriendLoc => x !== null)
      .filter((x) => x.distKm <= proximity)
      .sort((a, b) => a.distKm - b.distKm);
  }, [friends, locs, myPos, proximity]);

  // Map pin positions: relative to proximity radius, centered on user
  function pinXY(fl: FriendLoc) {
    if (!myPos) return { x: 50, y: 50 };
    const dx = (fl.loc.lng - myPos.lng) * Math.cos((myPos.lat * Math.PI) / 180);
    const dy = fl.loc.lat - myPos.lat;
    // Convert proximity (km) to degrees roughly (1 deg lat ≈ 111 km)
    const radiusDeg = proximity / 111;
    const scale = 40; // % of map (radius)
    const x = 50 + (dx / radiusDeg) * scale;
    const y = 50 - (dy / radiusDeg) * scale;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="pop-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-primary">Squad Nearby</h2>
              <button onClick={startTracking} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-display font-extrabold uppercase tracking-wider pop-shadow-pink">
                <Crosshair className="h-3 w-3" />
                {myPos ? "Re-sync" : "Locate me"}
              </button>
            </div>

            {geoError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary text-xs text-secondary">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{geoError}</span>
              </div>
            )}
            {!myPos && !geoError && (
              <div className="text-xs text-muted-foreground">Tap "Locate me" to share your position with your squad and see them on the radar.</div>
            )}
            {myPos && (
              <div className="text-[11px] text-muted-foreground">
                You: {myPos.lat.toFixed(4)}, {myPos.lng.toFixed(4)}
              </div>
            )}

            {friendLocs.length === 0 && myPos && (
              <div className="text-sm text-muted-foreground italic">
                No squad members within {proximity.toFixed(1)} km. Widen the radius or invite friends.
              </div>
            )}

            <div className="space-y-2">
              {friendLocs.map((fl, i) => (
                <div key={fl.profile.id} className={`flex items-center gap-3 p-3 rounded-2xl ${i === 0 ? "border-2 border-primary pop-shadow-pink" : "bg-surface-high"}`}>
                  <div className="h-10 w-10 rounded-full grid place-items-center font-display font-extrabold text-primary-foreground bg-gradient-to-br from-primary to-secondary">
                    {fl.profile.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold tracking-wider truncate">@{fl.profile.username}</div>
                    <div className="text-xs text-primary font-bold">{formatDist(fl.distKm)} away</div>
                  </div>
                  {i === 0 && (
                    <button className="h-9 w-9 grid place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Nudge">
                      <Zap className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pop-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">Proximity</span>
              <span className="font-display text-sm font-extrabold text-primary">{proximity.toFixed(1)} KM</span>
            </div>
            <input type="range" min={0.5} max={50} step={0.5} value={proximity}
              onChange={(e) => setProximity(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
          </div>
        </aside>

        {/* Map */}
        <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px] rounded-3xl overflow-hidden radar-bg border border-border">
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="relative h-[80%] aspect-square">
              <div className="absolute inset-0 animate-radar-sweep origin-center">
                <div className="absolute top-1/2 left-1/2 origin-left h-[1px] w-1/2"
                  style={{ background: "linear-gradient(to right, oklch(0.9 0.27 125 / 0.6), transparent)", transform: "translateY(-50%)" }} />
              </div>
              {/* concentric rings */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="absolute rounded-full border border-primary/15"
                  style={{ inset: `${(4 - i) * 12.5}%` }} />
              ))}
            </div>
          </div>

          {/* You pin */}
          {myPos && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <div className="relative h-14 w-14 rounded-full overflow-hidden ring-4 ring-primary animate-pulse-ring grid place-items-center font-display font-extrabold text-primary-foreground bg-gradient-to-br from-primary to-secondary">
                {profile?.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-extrabold bg-primary text-primary-foreground pop-shadow-pink">YOU</span>
            </div>
          )}

          {/* Friend pins */}
          {friendLocs.map((fl) => {
            const { x, y } = pinXY(fl);
            return (
              <div key={fl.profile.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-700"
                style={{ left: `${x}%`, top: `${y}%` }}>
                <div className="relative h-12 w-12 rounded-full overflow-hidden ring-4 ring-secondary grid place-items-center font-display font-extrabold text-secondary-foreground bg-gradient-to-br from-secondary to-accent">
                  {fl.profile.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-extrabold bg-background/80 text-foreground border border-border">
                  {formatDist(fl.distKm)}
                </span>
              </div>
            );
          })}

          {!myPos && (
            <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-sm">
              <div className="text-center max-w-xs px-6">
                <MapPin className="h-12 w-12 mx-auto text-primary mb-3" />
                <div className="font-display text-xl font-extrabold uppercase">Enable Location</div>
                <p className="text-sm text-muted-foreground mt-2">Share your position to find your squad on the radar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
