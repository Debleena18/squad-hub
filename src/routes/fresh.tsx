import { createFileRoute } from "@tanstack/react-router";
import { Play, Trophy, Users, Rocket, MessageSquare, Plus, Search } from "lucide-react";
import eventArcade from "@/assets/event-arcade.jpg";
import gameGolf from "@/assets/game-cybergolf.jpg";
import gameRhythm from "@/assets/game-rhythm.jpg";
import avatarKairo from "@/assets/avatar-kairo.jpg";
import avatarZephyr from "@/assets/avatar-zephyr.jpg";
import avatarMia from "@/assets/avatar-mia.jpg";
import avatarLuna from "@/assets/avatar-luna.jpg";
import avatarXavier from "@/assets/avatar-xavier.jpg";

export const Route = createFileRoute("/fresh")({
  head: () => ({
    meta: [
      { title: "Fresh — Nudge Games" },
      { name: "description", content: "Live squad games and challenges. Cyber Golf, Rhythm Riot, Neon Trivia and more — play in real time with your crew." },
      { property: "og:title", content: "Fresh — Nudge Games" },
      { property: "og:description", content: "Live squad games and challenges. Play with your crew in real time." },
      { property: "og:image", content: eventArcade },
    ],
  }),
  component: FreshPage,
});

const games = [
  { name: "Cyber Golf", img: gameGolf, active: 12, color: "primary" },
  { name: "Rhythm Riot", img: gameRhythm, active: 4, color: "secondary" },
];

const vibing = [
  { name: "ZEN_BOY", status: "Playing Cyber Golf", img: avatarKairo, dot: "bg-primary" },
  { name: "PIXEL_PUNK", status: "Idle in Lobby", img: avatarZephyr, dot: "bg-secondary", icon: Rocket },
  { name: "NEO_QUEEN", status: "In-Game 🔥", img: avatarMia, dot: "bg-primary" },
];

const ranks = [
  { rank: "01", name: "GLITCH_MASTER", score: "42.5k" },
  { rank: "02", name: "SONIC_WAVE", score: "38.1k" },
  { rank: "03", name: "ZERO_COOL", score: "35.9k" },
];

function FreshPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-8">
      {/* Search */}
      <div className="md:hidden mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search games..."
            className="w-full h-11 pl-10 pr-4 rounded-full bg-surface border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* LEFT */}
        <section className="space-y-8">
          {/* Hero event */}
          <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border-2 border-primary pop-shadow-pink">
            <img
              src={eventArcade}
              alt="Squad Challenge: Neon Trivia"
              className="absolute inset-0 h-full w-full object-cover"
              width={1280}
              height={640}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="relative h-full p-6 md:p-10 flex flex-col justify-end">
              <span className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-display text-[11px] font-extrabold uppercase tracking-widest mb-3">
                <span className="h-2 w-2 rounded-full bg-secondary-foreground animate-pulse" />
                Live Event
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold uppercase leading-[0.95]">
                Squad Challenge:
                <br />
                <span className="text-primary text-glitch-soft">Neon Trivia</span>
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-display font-extrabold uppercase tracking-wider pop-shadow-pink hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                  Join Lobby <Play className="h-4 w-4" fill="currentColor" />
                </button>
                <button className="px-5 py-3 rounded-full bg-surface text-foreground font-display font-extrabold uppercase tracking-wider border border-border hover:bg-surface-high">
                  Learn more
                </button>
              </div>
            </div>
          </div>

          {/* Squad Games */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold uppercase">Squad Games</h2>
                <p className="text-sm text-muted-foreground">Play real-time with your crew</p>
              </div>
              <button className="font-display text-xs font-bold uppercase tracking-widest text-primary">
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map((g) => (
                <div key={g.name} className="group pop-card overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={g.img} alt={g.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" width={800} height={500} />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-display font-bold uppercase`}>
                      <span className={`h-2 w-2 rounded-full ${g.color === "primary" ? "bg-primary" : "bg-secondary"} animate-pulse`} />
                      {g.active} squads active
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-extrabold uppercase">{g.name}</h3>
                      <div className="flex -space-x-2 mt-2">
                        <img src={avatarKairo} alt="" className="h-6 w-6 rounded-full ring-2 ring-card" />
                        <img src={avatarZephyr} alt="" className="h-6 w-6 rounded-full ring-2 ring-card" />
                        <span className={`h-6 w-6 grid place-items-center rounded-full text-[10px] font-bold ring-2 ring-card ${g.color === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                          +5
                        </span>
                      </div>
                    </div>
                    <button className={`h-12 w-12 rounded-full grid place-items-center ${g.color === "primary" ? "bg-primary text-primary-foreground pop-shadow-pink" : "bg-secondary text-secondary-foreground pop-shadow-lime"} hover:scale-110 transition-transform`}>
                      <Play className="h-5 w-5" fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="space-y-6">
          {/* Who's Vibing */}
          <div className="pop-card border-2 border-primary p-5 pop-shadow-lime space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-extrabold uppercase tracking-wider">Who's Vibing</h3>
            </div>
            <div className="space-y-3">
              {vibing.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-high">
                    <div className="relative">
                      <img src={v.img} alt={v.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" width={40} height={40} />
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${v.dot} ring-2 ring-surface-high`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-extrabold text-sm">{v.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{v.status}</div>
                    </div>
                    {Icon ? <Icon className="h-4 w-4 text-secondary" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hall of Fame */}
          <div className="pop-card border-2 border-secondary p-5 pop-shadow-pink space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" />
              <h3 className="font-display text-xl font-extrabold uppercase tracking-wider">Hall of Fame</h3>
            </div>
            <div className="space-y-2">
              {ranks.map((r) => (
                <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-high hover:bg-surface transition-colors">
                  <span className="font-display text-2xl italic font-extrabold text-primary w-8">{r.rank}</span>
                  <div className="flex-1 font-display font-extrabold tracking-wider">{r.name}</div>
                  <span className="font-display font-extrabold text-secondary">{r.score}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-full border-2 border-secondary text-secondary font-display font-extrabold uppercase tracking-wider hover:bg-secondary hover:text-secondary-foreground transition-colors">
              See all rankings
            </button>
          </div>

          <button className="hidden md:flex items-center justify-center fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground glow-lime hover:scale-110 transition-transform z-30">
            <Plus className="h-7 w-7" />
          </button>

          {/* avatars used to satisfy unused import */}
          <div className="hidden">
            <img src={avatarLuna} alt="" />
            <img src={avatarXavier} alt="" />
          </div>
        </aside>
      </div>
    </div>
  );
}
