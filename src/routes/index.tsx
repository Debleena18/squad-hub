import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Search, Plus, Share2, Map as MapIcon, Flame, Zap, Gem, Sparkles } from "lucide-react";
import avatarKairo from "@/assets/avatar-kairo.jpg";
import avatarZephyr from "@/assets/avatar-zephyr.jpg";
import avatarLuna from "@/assets/avatar-luna.jpg";
import avatarVee from "@/assets/avatar-vee.jpg";
import avatarMia from "@/assets/avatar-mia.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vibe — Nudge" },
      { name: "description", content: "Your daily nudge dashboard. See who's missing you, what's trending fresh, and hit your squad in one tap." },
      { property: "og:title", content: "Vibe — Nudge" },
      { property: "og:description", content: "Your daily nudge dashboard. See who's missing you and what's trending." },
    ],
  }),
  component: VibePage,
});

const missing = [
  { name: "KAIRO", status: "2 days ago", img: avatarKairo, badge: null, dot: "bg-primary" },
  { name: "ZEPHYR", status: "5 days ago", img: avatarZephyr, badge: "MISSING", dot: null },
  { name: "LUNA", status: "Active now", img: avatarLuna, badge: null, dot: "bg-primary" },
];

const trending = [
  { name: "NEON BURN", icon: Flame, color: "text-orange-400", border: "border-tertiary", shadow: "pop-shadow-purple" },
  { name: "CYBER BOLT", icon: Zap, color: "text-yellow-300", border: "border-primary", shadow: "pop-shadow-lime" },
  { name: "ICE CRUSH", icon: Gem, color: "text-cyan-300", border: "border-secondary", shadow: "pop-shadow-pink" },
];

function VibePage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-10">
      {/* Search bar (mobile) */}
      <div className="md:hidden mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search friends..."
            className="w-full h-11 pl-10 pr-4 rounded-full bg-surface border border-border focus:border-primary focus:glow-lime outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* LEFT */}
        <section className="space-y-8">
          {/* Missing You */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-display text-3xl md:text-4xl font-extrabold italic uppercase text-glitch-soft">
                Missing You
              </h1>
              <span className="hidden md:inline-flex items-center px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground font-display text-xs font-bold uppercase tracking-wider">
                4 nudges pending
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {missing.map((m) => (
                <button
                  key={m.name}
                  className="group relative pop-card p-4 flex flex-col items-center gap-3 hover:pop-shadow-pink"
                >
                  {m.badge && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-display font-bold uppercase text-secondary-foreground">
                      {m.badge}
                    </span>
                  )}
                  <div className="relative">
                    <img
                      src={m.img}
                      alt={m.name}
                      width={96}
                      height={96}
                      loading="lazy"
                      className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover ring-2 ring-primary/60"
                    />
                    {m.dot && (
                      <span className={`absolute bottom-1 right-1 h-3 w-3 rounded-full ${m.dot} ring-2 ring-background animate-pulse-ring`} />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-sm tracking-wider">{m.name}</div>
                    <div className="text-[11px] uppercase text-muted-foreground">{m.status}</div>
                  </div>
                </button>
              ))}
              <button className="pop-card p-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/60 bg-transparent hover:bg-primary/5">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-surface-high grid place-items-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div className="font-display font-bold text-sm text-primary tracking-wider">ADD SQUAD</div>
              </button>
            </div>
          </div>

          {/* Trending Fresh */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold italic uppercase text-primary">
                Trending Fresh
              </h2>
              <Link to="/fresh" className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {trending.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.name}
                    className={`group pop-card aspect-square flex flex-col items-center justify-center gap-3 border-2 ${t.border} hover:${t.shadow} hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform`}
                  >
                    <Icon className={`h-12 w-12 md:h-16 md:w-16 ${t.color} drop-shadow-[0_0_12px_currentColor]`} />
                    <span className="px-3 py-1 rounded-full bg-background/80 font-display text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary">
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community Highlight */}
          <div className="relative pop-card border-2 border-primary p-5 md:p-6 pop-shadow-lime">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-secondary glow-pink" />
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Community Highlight
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-extrabold uppercase">
                  The "Cyber Vibe" pack is now live!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Drop these new stickers on your friends to nudge them into the weekend. 12 new
                  animated drops inside.
                </p>
              </div>
              <button className="self-start md:self-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-display font-extrabold uppercase tracking-wider pop-shadow-pink hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform whitespace-nowrap">
                Grab it
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT — Quick Actions */}
        <aside className="space-y-4">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold italic uppercase text-secondary">
            Quick Actions
          </h2>

          <Link
            to="/squad"
            className="block pop-card p-4 hover:pop-shadow-pink group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary grid place-items-center text-secondary-foreground">
                <Share2 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display font-extrabold uppercase tracking-wider">Invite friends</div>
                <div className="text-xs text-muted-foreground uppercase">Earn 500 vibe points</div>
              </div>
            </div>
          </Link>

          <Link
            to="/map"
            className="block pop-card p-4 hover:pop-shadow-lime group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary grid place-items-center text-primary-foreground">
                <MapIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display font-extrabold uppercase tracking-wider">Find nearby</div>
                <div className="text-xs text-muted-foreground uppercase">24 friends nearby</div>
              </div>
            </div>
          </Link>

          {/* Pro Tip card with soft gradient */}
          <div className="relative gradient-soft rounded-2xl p-5 text-neutral-900">
            <span className="inline-block px-3 py-1 rounded-md bg-neutral-900 text-white font-display text-[10px] font-bold uppercase tracking-widest">
              Pro Tip
            </span>
            <p className="mt-3 font-medium leading-relaxed">
              Nudge friends 3 days in a row to start a fire streak!
            </p>
            <div className="mt-4 flex items-center -space-x-2">
              <img src={avatarVee} alt="" className="h-7 w-7 rounded-full ring-2 ring-white" loading="lazy" width={28} height={28} />
              <img src={avatarMia} alt="" className="h-7 w-7 rounded-full ring-2 ring-white" loading="lazy" width={28} height={28} />
              <img src={avatarKairo} alt="" className="h-7 w-7 rounded-full ring-2 ring-white" loading="lazy" width={28} height={28} />
              <span className="ml-3 px-2 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-bold">+12</span>
            </div>
          </div>

          <button className="hidden md:flex items-center justify-center fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground pop-shadow-pink hover:scale-110 transition-transform z-30">
            <Plus className="h-7 w-7" />
            <Sparkles className="absolute h-3 w-3 top-2 right-2" />
          </button>
        </aside>
      </div>
    </div>
  );
}
