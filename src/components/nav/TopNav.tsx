import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const tabs = [
  { label: "VIBE", to: "/" as const },
  { label: "MAP", to: "/map" as const },
  { label: "SQUAD", to: "/squad" as const },
  { label: "FRESH", to: "/fresh" as const },
  { label: "CHAT", to: "/chat" as const },
];

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase
        .from("friend_requests")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("status", "pending");
      setPending(count ?? 0);
    };
    load();
    const ch = supabase
      .channel("nav-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests", filter: `recipient_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-secondary/40">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="group flex items-center">
          <span className="font-display text-2xl md:text-3xl font-extrabold italic tracking-tight text-primary text-glitch">NUDGE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link key={t.to} to={t.to} className={`relative px-4 py-2 font-display text-sm font-bold tracking-wider uppercase transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {active && <span className="absolute -bottom-1 left-2 right-2 h-[2px] rounded-full bg-primary glow-lime" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/squad" aria-label="Notifications" className="relative h-10 w-10 grid place-items-center rounded-full hover:bg-surface-high transition-colors">
            <Bell className="h-5 w-5" />
            {pending > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-secondary text-secondary-foreground text-[10px] font-extrabold glow-pink">
                {pending}
              </span>
            )}
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-full bg-surface-high">
            <User className="h-4 w-4 text-primary" />
            <span className="font-display text-xs font-bold uppercase tracking-wider">{profile?.username ?? "..."}</span>
          </div>
          <button
            onClick={async () => { await signOut(); nav({ to: "/auth" }); }}
            aria-label="Sign out"
            className="h-10 w-10 grid place-items-center rounded-full bg-surface-high hover:bg-surface transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent" />
    </header>
  );
}
