import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState, Navigate } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { TopNav } from "@/components/nav/TopNav";
import { BottomNav } from "@/components/nav/BottomNav";
import { AuthProvider, useAuth } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-glitch">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">That vibe doesn't exist. Slide back home.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase text-primary-foreground pop-shadow-pink">
            Take me back
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nudge — Cyber-Pop Social Messenger" },
      { name: "description", content: "Nudge your squad, find your crew nearby, drop fresh stickers and play together." },
      { property: "og:title", content: "Nudge — Cyber-Pop Social Messenger" },
      { property: "og:description", content: "Nudge your squad. Drop fresh stickers. Vibe in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Spline+Sans:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body className="dark bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const PUBLIC_PATHS = ["/auth"];

function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/invite/");

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="font-display text-2xl italic text-glitch animate-pulse">NUDGE</div>
      </div>
    );
  }
  if (!user && !isPublic) return <Navigate to="/auth" />;
  return <>{children}</>;
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = pathname === "/auth";

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {!isAuthPage && <TopNav />}
        <main className="flex-1 pb-24 md:pb-8">
          <Gate>
            <Outlet />
          </Gate>
        </main>
        {!isAuthPage && <BottomNav />}
      </div>
    </AuthProvider>
  );
}
