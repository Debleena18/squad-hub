import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";

const tabs = [
  { label: "VIBE", to: "/" as const },
  { label: "MAP", to: "/map" as const },
  { label: "SQUAD", to: "/squad" as const },
  { label: "FRESH", to: "/fresh" as const },
  { label: "CHAT", to: "/chat" as const },
];

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-secondary/40">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="group flex items-center">
          <span className="font-display text-2xl md:text-3xl font-extrabold italic tracking-tight text-primary text-glitch">
            NUDGE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`relative px-4 py-2 font-display text-sm font-bold tracking-wider uppercase transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute -bottom-1 left-2 right-2 h-[2px] rounded-full bg-primary glow-lime" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="relative h-10 w-10 grid place-items-center rounded-full hover:bg-surface-high transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-secondary glow-pink" />
          </button>
          <button
            aria-label="Profile"
            className="h-10 w-10 grid place-items-center rounded-full bg-surface-high hover:bg-surface transition-colors"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent" />
    </header>
  );
}
