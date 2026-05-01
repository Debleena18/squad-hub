import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Smile, Plus, Video, MoreVertical } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Nudge" },
      { name: "description", content: "Real-time squad chats." },
    ],
  }),
  component: ChatPage,
});

type Profile = { id: string; username: string; display_name: string; avatar_url: string | null; vibe: string | null };
type Message = { id: string; sender_id: string; recipient_id: string; content: string; kind: "text" | "sticker"; created_at: string; read_at: string | null };
type ChatPreview = { friend: Profile; lastMessage: Message | null };

const STICKERS = ["🔥", "👾", "✨", "🖤", "🍭", "🎸", "🫧", "💜"];

function Avatar({ p, size = 44 }: { p: Profile | null; size?: number }) {
  const initials = (p?.display_name ?? p?.username ?? "?").slice(0, 2).toUpperCase();
  if (p?.avatar_url) return <img src={p.avatar_url} alt={p.username} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full grid place-items-center font-display font-extrabold text-primary-foreground bg-gradient-to-br from-primary to-secondary"
      style={{ width: size, height: size, fontSize: size / 2.8 }}>{initials}</div>
  );
}

function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = chats.find(c => c.friend.id === activeId)?.friend ?? null;

  // Load friends list
  const loadChats = useCallback(async () => {
    if (!user) return;
    const { data: reqs } = await supabase
      .from("friend_requests")
      .select("sender_id, recipient_id, sender:profiles!friend_requests_sender_id_fkey(*), recipient:profiles!friend_requests_recipient_id_fkey(*)")
      .eq("status", "accepted")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

    const friends: Profile[] = (reqs ?? []).map((r: any) => r.sender_id === user.id ? r.recipient : r.sender).filter(Boolean);

    // Get last message for each
    const previews: ChatPreview[] = await Promise.all(friends.map(async (f) => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${f.id}),and(sender_id.eq.${f.id},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return { friend: f, lastMessage: (data as Message) ?? null };
    }));

    previews.sort((a, b) => {
      const at = a.lastMessage?.created_at ?? "0";
      const bt = b.lastMessage?.created_at ?? "0";
      return bt.localeCompare(at);
    });
    setChats(previews);
    if (!activeId && previews.length > 0) setActiveId(previews[0].friend.id);
  }, [user, activeId]);

  // Load messages for active chat
  const loadMessages = useCallback(async () => {
    if (!user || !activeId) { setMessages([]); return; }
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${activeId}),and(sender_id.eq.${activeId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data as Message[]) ?? []);
    // mark unread incoming as read
    await supabase.from("messages").update({ read_at: new Date().toISOString() })
      .eq("sender_id", activeId).eq("recipient_id", user.id).is("read_at", null);
  }, [user, activeId]);

  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Realtime: any new message involving me
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`chat-${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          const m = payload.new as Message;
          if (m.sender_id === activeId) {
            setMessages((prev) => [...prev, m]);
            supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", m.id).then();
          }
          loadChats();
        })
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        (payload) => {
          const m = payload.new as Message;
          if (m.recipient_id === activeId) setMessages((prev) => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
          loadChats();
        })
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => prev.map(x => x.id === m.id ? m : x));
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, activeId, loadChats]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(content: string, kind: "text" | "sticker" = "text") {
    if (!user || !activeId || !content.trim()) return;
    setInput("");
    await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: activeId,
      content,
      kind,
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-2 md:px-6 py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
        {/* Chat list */}
        <aside className="hidden md:flex flex-col gap-3 pop-card p-4 overflow-hidden">
          <h2 className="font-display text-xl font-extrabold italic uppercase text-glitch-soft">Squad Chats</h2>
          {chats.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">No squad members yet. Add friends from the Squad tab to start chatting.</div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1 scrollbar-hide">
              {chats.map((c) => (
                <button key={c.friend.id} onClick={() => setActiveId(c.friend.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all ${activeId === c.friend.id ? "bg-primary/10 border-2 border-primary pop-shadow-pink" : "border-2 border-transparent hover:bg-surface-high"}`}>
                  <div className="flex items-start gap-3">
                    <Avatar p={c.friend} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-extrabold tracking-wider text-sm truncate">@{c.friend.username}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.lastMessage ? (c.lastMessage.kind === "sticker" ? "🎨 Sticker" : c.lastMessage.content) : "Say hi!"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Conversation */}
        <section className="flex flex-col pop-card overflow-hidden">
          {!active ? (
            <div className="flex-1 grid place-items-center text-muted-foreground">
              {chats.length === 0 ? "Add some friends first" : "Select a chat"}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar p={active} size={40} />
                  <div>
                    <div className="font-display font-extrabold tracking-wider">@{active.username}</div>
                    <div className="text-xs text-muted-foreground">{active.vibe ?? "vibing"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Video call" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-high hover:bg-surface"><Video className="h-5 w-5" /></button>
                  <button aria-label="More" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-high hover:bg-surface"><MoreVertical className="h-5 w-5" /></button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide">
                {messages.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No messages yet. Drop a sticker to break the ice 🔥</div>}
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  const isSticker = m.kind === "sticker";
                  return (
                    <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <div className={`${isSticker ? "text-5xl" : `max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-surface-high text-foreground rounded-bl-sm"}`}`}>
                        {m.content}
                      </div>
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {mine && m.read_at ? " · Read" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border p-3 md:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <button className="h-11 w-11 grid place-items-center rounded-full bg-surface-high text-primary"><Plus className="h-5 w-5" /></button>
                  <div className="flex-1 relative">
                    <input value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send(input)}
                      placeholder="Type a message…"
                      className="w-full h-11 pl-4 pr-11 rounded-full bg-surface-high border border-border focus:border-primary outline-none" />
                    <Smile className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  </div>
                  <button onClick={() => send(input)} aria-label="Send"
                    className="h-11 w-11 grid place-items-center rounded-2xl bg-primary text-primary-foreground pop-shadow-pink hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {STICKERS.map((e) => (
                    <button key={e} onClick={() => send(e, "sticker")}
                      className="shrink-0 h-12 w-12 grid place-items-center rounded-xl text-2xl border border-border bg-surface-high hover:border-primary hover:bg-primary/5 transition-colors">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
