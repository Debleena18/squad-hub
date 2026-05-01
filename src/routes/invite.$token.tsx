import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = useState<string>("Checking invite...");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      sessionStorage.setItem("pendingInvite", token);
      return;
    }
    (async () => {
      const { data: inv, error } = await supabase
        .from("invite_links")
        .select("creator_id, expires_at")
        .eq("token", token)
        .maybeSingle();
      if (error || !inv) return setStatus("Invite is invalid or expired.");
      if (inv.expires_at && new Date(inv.expires_at) < new Date()) return setStatus("This invite has expired.");
      if (inv.creator_id === user.id) return setStatus("That's your own invite link!");

      // Already friends? Already a request?
      const { data: existing } = await supabase
        .from("friend_requests")
        .select("id, status")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${inv.creator_id}),and(sender_id.eq.${inv.creator_id},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (existing?.status === "accepted") setStatus("You're already in this squad ✓");
      else if (existing) setStatus("Request already pending.");
      else {
        const { error: insErr } = await supabase
          .from("friend_requests")
          .insert({ sender_id: user.id, recipient_id: inv.creator_id });
        if (insErr) setStatus("Couldn't send request: " + insErr.message);
        else setStatus("Request sent! Redirecting to squad...");
      }
      sessionStorage.removeItem("pendingInvite");
      setTimeout(() => nav({ to: "/squad" }), 1500);
    })();
  }, [user, loading, token, nav]);

  if (!loading && !user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="pop-card p-8 text-center max-w-md">
        <h1 className="font-display text-2xl font-extrabold uppercase">Squad Invite</h1>
        <p className="mt-4 text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
