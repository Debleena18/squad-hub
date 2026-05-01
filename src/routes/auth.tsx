import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Nudge" },
      { name: "description", content: "Sign in or join Nudge — the cyber-pop social messenger." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setBusy(false);
    if (error) setError(error);
    else nav({ to: "/" });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md pop-card p-8 space-y-6">
        <div className="text-center">
          <div className="font-display text-4xl font-extrabold italic text-glitch">NUDGE</div>
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest font-bold">
            {mode === "signin" ? "Slide back in" : "Join the chaos"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                placeholder="cyber_kid"
                className="w-full h-11 px-4 rounded-xl bg-surface-high border border-border focus:border-primary outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl bg-surface-high border border-border focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-11 px-4 rounded-xl bg-surface-high border border-border focus:border-primary outline-none"
            />
          </div>

          {error && <div className="text-sm text-secondary font-bold">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-display font-extrabold uppercase tracking-wider pop-shadow-pink hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {mode === "signin" ? "No account? Sign up →" : "Already have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}
