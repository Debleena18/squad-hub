import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, MessageSquare, Heart, Ban, Lock, Search, X } from "lucide-react";
import avatarXavier from "@/assets/avatar-xavier.jpg";
import avatarLuna from "@/assets/avatar-luna.jpg";
import avatarKairo from "@/assets/avatar-kairo.jpg";
import avatarMia from "@/assets/avatar-mia.jpg";
import avatarZephyr from "@/assets/avatar-zephyr.jpg";
import avatarVee from "@/assets/avatar-vee.jpg";

export const Route = createFileRoute("/squad")({
  head: () => ({
    meta: [
      { title: "Squad — Nudge" },
      { name: "description", content: "Manage your inner circle. Control nudge permissions, accept new friends, and grow your crew." },
      { property: "og:title", content: "Squad — Nudge" },
      { property: "og:description", content: "Manage your inner circle and grow your crew." },
    ],
  }),
  component: SquadPage,
});

const squad = [
  { name: "Xavier_K", sub: "Last Nudge: 2m ago", img: avatarXavier, dot: "bg-primary", icon: Zap, ringActive: true },
  { name: "Luna.Vibe", sub: "Offline", img: avatarLuna, dot: "bg-muted-foreground", icon: MessageSquare },
  { name: "Cyber_Sam", sub: "Nudging Now…", img: avatarKairo, dot: "bg-primary", icon: Heart, iconColor: "text-secondary" },
  { name: "Dizzy_Liz", sub: "Last active 4h", img: avatarMia, dot: null, icon: Ban, iconColor: "text-muted-foreground" },
];

const requests = [
  { name: "Neon_Dreamer", shared: 12, img: avatarZephyr },
  { name: "Static_Pulse", shared: 3, img: avatarXavier },
  { name: "Glitch_Girl", shared: 8, img: avatarVee },
];

type Perm = { id: string; label: string; sub: string; on: boolean };

function SquadPage() {
  const [perms, setPerms] = useState<Perm[]>([
    { id: "inner", label: "The Inner Circle", sub: "Can poke 24/7", on: true },
    { id: "squad", label: "The Squad", sub: "Daytime only (9-9)", on: true },
    { id: "fresh", label: "Fresh Meat", sub: "Invite only access", on: false },
  ]);
  const [tags, setTags] = useState(["Gamer", "Vaporwave"]);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-10">
      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold italic uppercase text-glitch-soft">
          Social Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your inner circle, control the chaos, and grow the squad.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* LEFT */}
        <section className="space-y-8">
          {/* My Squad */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider">My Squad</h2>
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-display text-xs font-bold uppercase">
                24 active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {squad.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.name}
                    className={`pop-card p-4 flex items-center gap-4 text-left ${
                      i === 0 ? "border-2 border-primary pop-shadow-purple" : "hover:pop-shadow-pink"
                    }`}
                  >
                    <div className="relative">
                      <img src={s.img} alt={s.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" width={48} height={48} />
                      {s.dot && <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${s.dot} ring-2 ring-card`} />}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-extrabold text-lg">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.sub}</div>
                    </div>
                    <Icon className={`h-5 w-5 ${s.iconColor ?? "text-primary"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending Requests */}
          <div>
            <h2 className="font-display text-2xl font-extrabold italic uppercase text-secondary mb-4">
              Pending Requests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {requests.map((r) => (
                <div key={r.name} className="pop-card p-4 space-y-3 border border-primary/30">
                  <div className="flex items-center gap-3">
                    <img src={r.img} alt={r.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" width={40} height={40} />
                    <div>
                      <div className="font-display font-extrabold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">Shared friends: {r.shared}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-full bg-primary text-primary-foreground font-display text-xs font-extrabold uppercase tracking-wider hover:pop-shadow-pink transition-shadow">
                      Accept
                    </button>
                    <button className="flex-1 py-2 rounded-full bg-surface-high text-foreground font-display text-xs font-extrabold uppercase tracking-wider hover:bg-surface">
                      Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="space-y-6">
          {/* Permissions */}
          <div className="pop-card border-2 border-secondary pop-shadow-pink p-5 space-y-4">
            <div className="flex items-center gap-2 text-secondary">
              <Lock className="h-5 w-5" />
              <h3 className="font-display text-xl font-extrabold uppercase tracking-wider">Permissions</h3>
            </div>
            <div className="space-y-3">
              {perms.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    p.on ? "border-primary/40 bg-primary/5" : "border-border bg-surface-high"
                  }`}
                >
                  <div>
                    <div className={`font-display font-extrabold uppercase text-sm ${p.on ? "text-primary" : ""}`}>
                      {p.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  </div>
                  <button
                    onClick={() => setPerms((prev) => prev.map((x) => (x.id === p.id ? { ...x, on: !x.on } : x)))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${p.on ? "bg-primary" : "bg-muted"}`}
                    aria-label={`Toggle ${p.label}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                        p.on ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-full bg-secondary text-secondary-foreground font-display font-extrabold uppercase tracking-wider hover:pop-shadow-lime transition-shadow">
              Update Wall
            </button>
          </div>

          {/* Grow the Squad */}
          <div className="pop-card border-2 border-primary p-5 space-y-4 bg-primary/10">
            <h3 className="font-display text-xl font-extrabold uppercase tracking-wider">Grow the Squad</h3>
            <div className="relative">
              <input
                placeholder="Search by @handle…"
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-medium"
                >
                  #{t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <button className="w-full py-3 rounded-full bg-primary-foreground text-primary font-display font-extrabold uppercase tracking-wider border-2 border-primary-foreground hover:bg-background hover:text-primary-foreground transition-colors">
              Blast invite
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
