import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, Users, Compass, MessageCircle } from "lucide-react";

const tabs = [
  { label: "Vibe", to: "/" as const, icon: Home },
  { label: "Map", to: "/map" as const, icon: Map },
  { label: "Squad", to: "/squad" as const, icon: Users },
  { label: "Fresh", to: "/fresh" as const, icon: Compass },
  { label: "Chat", to: "/chat" as const, icon: MessageCircle },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass-strong rounded-2xl border border-secondary/50 pop-shadow-pink">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                active
                  ? "bg-primary text-primary-foreground scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="font-display text-[10px] font-bold uppercase tracking-wider">
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
