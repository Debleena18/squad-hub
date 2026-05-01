import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Zap, ChevronRight } from "lucide-react";
import avatarMia from "@/assets/avatar-mia.jpg";
import avatarKairo from "@/assets/avatar-kairo.jpg";
import avatarVee from "@/assets/avatar-vee.jpg";
import avatarZephyr from "@/assets/avatar-zephyr.jpg";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — Nudge" },
      { name: "description", content: "Find your squad in real time. Live radar of nearby friends with proximity-based nudges." },
      { property: "og:title", content: "Map — Nudge" },
      { property: "og:description", content: "Live radar of nearby friends. Nudge them when you're close." },
    ],
  }),
  component: MapPage,
});

const pins = [
  { x: 50, y: 50, name: "YOU", img: avatarVee, color: "primary", dist: "350m", featured: true },
  { x: 75, y: 28, name: "SOL", img: avatarKairo, color: "secondary", dist: "2.8km" },
  { x: 30, y: 78, name: "REX", img: avatarZephyr, color: "secondary", dist: "1.2km" },
];

function MapPage() {
  const [proximity, setProximity] = useState(5);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="pop-card p-5 space-y-4">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-primary">
              Squad Nearby
            </h2>

            {/* Featured nearby */}
            <div className="rounded-2xl border-2 border-primary p-4 pop-shadow-pink">
              <div className="flex items-center gap-3 mb-3">
                <img src={avatarMia} alt="Mia" loading="lazy" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="font-display font-extrabold tracking-wider">MIA_VIBE</div>
                  <div className="text-xs">
                    <span className="text-primary font-bold">350m</span>
                    <span className="text-muted-foreground"> · ACTIVE NOW</span>
                  </div>
                </div>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-display font-extrabold uppercase tracking-wider pop-shadow-pink hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                <Zap className="h-4 w-4" />
                Nudge her
              </button>
            </div>

            <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-surface-high hover:bg-surface transition-colors text-left">
              <img src={avatarKairo} alt="Kai" loading="lazy" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-display font-bold tracking-wider">KAI_GRID</div>
                <div className="text-xs text-muted-foreground">1.2km · 8 min ago</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="pop-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                Proximity
              </span>
              <span className="font-display text-sm font-extrabold text-primary">{proximity.toFixed(1)} KM</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.1}
              value={proximity}
              onChange={(e) => setProximity(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </aside>

        {/* Map */}
        <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px] rounded-3xl overflow-hidden radar-bg border border-border">
          {/* sweep */}
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="relative h-[80%] aspect-square">
              <div className="absolute inset-0 animate-radar-sweep origin-center">
                <div
                  className="absolute top-1/2 left-1/2 origin-left h-[1px] w-1/2"
                  style={{
                    background: "linear-gradient(to right, oklch(0.9 0.27 125 / 0.6), transparent)",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pins */}
          {pins.map((p) => (
            <div
              key={p.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div
                className={`relative h-14 w-14 rounded-full overflow-hidden ring-4 ${
                  p.featured ? "ring-primary animate-pulse-ring" : p.color === "secondary" ? "ring-secondary" : "ring-primary"
                }`}
              >
                <img src={p.img} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-display font-extrabold ${
                  p.featured
                    ? "bg-primary text-primary-foreground pop-shadow-pink"
                    : "bg-background/80 text-foreground border border-border"
                }`}
              >
                {p.dist}
              </span>
            </div>
          ))}

          {/* Search FAB */}
          <button className="absolute bottom-5 right-5 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center pop-shadow-pink hover:scale-110 transition-transform">
            <Search className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
