import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Zap, Search, X, Lock, Link2, Copy, Check, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "Squad — Nudge" },
      { name: "description", content: "Manage your inner circle. Accept requests, send invites, and grow your crew." },
    ],
  }),
  component: SquadPage,
});

type Profile = { id: string; username: string; display_name: string; avatar_url: string | null; vibe: string | null };
type Request = { id: string; sender_id: string; recipient_id: string; status: string; created_at: string; sender: Profile | null; recipient: Profile | null };

function Avatar({ p, size = 40 }: { p: Profile | null; size?: number }) {
  const initials = (p?.display_name ?? p?.username ?? "?").slice(0, 2).toUpperCase();
  if (p?.avatar_url) return <img src={p.avatar_url} alt={p.username} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full grid place-items-center font-display font-extrabold text-primary-foreground bg-gradient-to-br from-primary to-secondary"
      style={{ width: size, height: size, fontSize: size / 2.8 }}>
      {initials}
    </div>
  );
}

function SquadPage() {
  const { user, profile } = useAuth();
  const [perms, setPerms] = useState([
    { id: "inner", label: "The Inner Circle", sub: "Can poke 24/7", on: true },
    { id: "squad", label: "The Squad", sub: "Daytime only (9-9)", on: true },
    { id: "fresh", label: "Fresh Meat", sub: "Invite only access", on: false },
  ]);

  const [friends, setFriends] = useState<Profile[]>([]);
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const { data: reqs } = await supabase
      .from("friend_requests")
      .select("*, sender:profiles!friend_requests_sender_id_fkey(*), recipient:profiles!friend_requests_recipient_id_fkey(*)")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const all = (reqs ?? []) as unknown as Request[];
    setFriends(all.filter(r => r.status === "accepted").map(r => (r.sender_id === user.id ? r.recipient! : r.sender!)).filter(Boolean));
    setIncoming(all.filter(r => r.status === "pending" && r.recipient_id === user.id));
    setOutgoing(all.filter(r => r.status === "pending" && r.sender_id === user.id));
  }, [user]);

  useEffect(() => {
    loadAll();
    if (!user) return;
    const ch = supabase
      .channel("squad-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, loadAll]);

  // Search
  useEffect(() => {
    if (!user || searchTerm.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchTerm.trim().replace(/^@/, "")}%`)
        .neq("id", user.id)
        .limit(8);
      setSearchResults((data as Profile[]) ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm, user]);

  async function sendRequest(toId: string) {
    if (!user) return;
    await supabase.from("friend_requests").insert({ sender_id: user.id, recipient_id: toId });
    setSearchTerm("");
    setSearchResults([]);
    loadAll();
  }
  async function respond(id: string, status: "accepted" | "declined") {
    await supabase.from("friend_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    loadAll();
  }
  async function removeFriend(otherId: string) {
    if (!user) return;
    await supabase.from("friend_requests").delete()
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`);
    loadAll();
  }
  async function generateInvite() {
    if (!user) return;
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    const { error } = await supabase.from("invite_links").insert({ token, creator_id: user.id, expires_at: expires });
    if (!error) setInviteUrl(`${window.location.origin}/invite/${token}`);
  }
  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold italic uppercase text-glitch-soft">Social Hub</h1>
        <p className="text-muted-foreground mt-2">Welcome back, <span className="text-primary font-bold">@{profile?.username}</span> — manage your inner circle.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <section className="space-y-8">
          {/* My Squad */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider">My Squad</h2>
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-display text-xs font-bold uppercase">
                {friends.length} active
              </span>
            </div>
            {friends.length === 0 ? (
              <div className="pop-card p-8 text-center text-muted-foreground">
                No squad yet. Search a username or share your invite link to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {friends.map((f) => (
                  <div key={f.id} className="pop-card p-4 flex items-center gap-4 hover:pop-shadow-pink">
                    <Avatar p={f} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-extrabold text-lg truncate">@{f.username}</div>
                      <div className="text-xs text-muted-foreground truncate">{f.vibe ?? "Just vibing"}</div>
                    </div>
                    <button onClick={() => removeFriend(f.id)} aria-label="Remove" className="h-8 w-8 grid place-items-center rounded-full hover:bg-surface text-muted-foreground hover:text-secondary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming requests */}
          <div>
            <h2 className="font-display text-2xl font-extrabold italic uppercase text-secondary mb-4">
              Pending Requests {incoming.length > 0 && <span className="text-base">({incoming.length})</span>}
            </h2>
            {incoming.length === 0 ? (
              <div className="pop-card p-6 text-center text-sm text-muted-foreground">No pending requests.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {incoming.map((r) => (
                  <div key={r.id} className="pop-card p-4 space-y-3 border border-primary/30">
                    <div className="flex items-center gap-3">
                      <Avatar p={r.sender} />
                      <div className="min-w-0">
                        <div className="font-display font-extrabold truncate">@{r.sender?.username}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.sender?.display_name}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => respond(r.id, "accepted")} className="flex-1 py-2 rounded-full bg-primary text-primary-foreground font-display text-xs font-extrabold uppercase tracking-wider hover:pop-shadow-pink transition-shadow">Accept</button>
                      <button onClick={() => respond(r.id, "declined")} className="flex-1 py-2 rounded-full bg-surface-high text-foreground font-display text-xs font-extrabold uppercase tracking-wider hover:bg-surface">Pass</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          {outgoing.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-muted-foreground mb-3">Sent</h2>
              <div className="flex flex-wrap gap-2">
                {outgoing.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-surface-high text-sm">
                    <Avatar p={r.recipient} size={20} />
                    @{r.recipient?.username}
                    <span className="text-xs text-muted-foreground">pending</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT */}
        <aside className="space-y-6">
          {/* Permissions (UI only) */}
          <div className="pop-card border-2 border-secondary pop-shadow-pink p-5 space-y-4">
            <div className="flex items-center gap-2 text-secondary">
              <Lock className="h-5 w-5" />
              <h3 className="font-display text-xl font-extrabold uppercase tracking-wider">Permissions</h3>
            </div>
            <div className="space-y-3">
              {perms.map((p) => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${p.on ? "border-primary/40 bg-primary/5" : "border-border bg-surface-high"}`}>
                  <div>
                    <div className={`font-display font-extrabold uppercase text-sm ${p.on ? "text-primary" : ""}`}>{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  </div>
                  <button onClick={() => setPerms(prev => prev.map(x => x.id === p.id ? { ...x, on: !x.on } : x))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${p.on ? "bg-primary" : "bg-muted"}`} aria-label={`Toggle ${p.label}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${p.on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grow the squad */}
          <div className="pop-card border-2 border-primary p-5 space-y-4 bg-primary/10">
            <h3 className="font-display text-xl font-extrabold uppercase tracking-wider">Grow the Squad</h3>
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by @handle…"
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((p) => {
                  const isFriend = friends.some(f => f.id === p.id);
                  const sent = outgoing.some(r => r.recipient_id === p.id);
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-background">
                      <Avatar p={p} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-sm truncate">@{p.username}</div>
                      </div>
                      <button
                        disabled={isFriend || sent}
                        onClick={() => sendRequest(p.id)}
                        className="inline-flex items-center gap-1 px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-display font-extrabold uppercase disabled:opacity-50"
                      >
                        <UserPlus className="h-3 w-3" />
                        {isFriend ? "Friends" : sent ? "Sent" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Or share invite link</div>
              {inviteUrl ? (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border">
                  <Link2 className="h-4 w-4 text-primary shrink-0 ml-1" />
                  <input readOnly value={inviteUrl} className="flex-1 bg-transparent text-xs outline-none truncate" />
                  <button onClick={copyInvite} className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground" aria-label="Copy">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <button onClick={generateInvite} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary-foreground text-primary font-display font-extrabold uppercase tracking-wider border-2 border-primary-foreground hover:bg-background transition-colors">
                  <Zap className="h-4 w-4" />
                  Generate invite
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
