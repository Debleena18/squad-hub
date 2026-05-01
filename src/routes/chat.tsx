import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Search, Send, Smile, Plus, Video, MoreVertical, Navigation, MapPin } from "lucide-react";
import avatarVee from "@/assets/avatar-vee.jpg";
import avatarKairo from "@/assets/avatar-kairo.jpg";
import avatarMia from "@/assets/avatar-mia.jpg";
import stickerVibe from "@/assets/sticker-vibe.jpg";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Nudge" },
      { name: "description", content: "Squad chats with stickers, video calls, and live presence. Stay connected with your inner circle." },
      { property: "og:title", content: "Chat — Nudge" },
      { property: "og:description", content: "Squad chats with stickers and live presence." },
    ],
  }),
  component: ChatPage,
});

const chats = [
  { id: "vee", name: "VEE_CYBER", preview: "That drop tonight is gonna be insa…", time: "2m ago", img: avatarVee, location: "In the area", active: true },
  { id: "kai", name: "KAI_VOID", preview: "Link is in the bio, check it.", time: "1h ago", img: avatarKairo },
  { id: "neon", name: "NEON_SOUL", preview: "Are you coming to the pop-up?", time: "4h ago", img: avatarMia, location: "3 miles away" },
];

const stickerEmojis = ["🔥", "👾", "✨", "🖤", "🍭", "🎸", "🫧", "+"];

type Msg = { id: string; from: "me" | "them"; text?: string; sticker?: string; time: string; read?: boolean };

function ChatPage() {
  const [activeId, setActiveId] = useState("vee");
  const active = chats.find((c) => c.id === activeId)!;
  const [messages, setMessages] = useState<Msg[]>([
    { id: "1", from: "them", text: "Yo! Did you see the new sticker drop in the Fresh tab? It's literally peak Brat aesthetic.", time: "10:42 PM" },
    { id: "2", from: "me", text: "OMG yes!! I already claimed the limited holographic one. Are you coming to the district meet later?", time: "10:45 PM", read: true },
    { id: "3", from: "them", sticker: stickerVibe, time: "10:47 PM" },
    { id: "4", from: "them", text: "Look at this vibe! See you in 15? I'm already in the area anyway.", time: "10:48 PM" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => setTyping(false), 4000);
    return () => clearTimeout(t);
  }, []);

  function send() {
    if (!input.trim()) return;
    setMessages((m) => [
      ...m,
      { id: String(Date.now()), from: "me", text: input, time: "Now", read: false },
    ]);
    setInput("");
  }

  function sendSticker(emoji: string) {
    if (emoji === "+") return;
    setMessages((m) => [
      ...m,
      { id: String(Date.now()), from: "me", text: emoji, time: "Now", read: false },
    ]);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-2 md:px-6 py-4 md:py-6">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px] gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
        {/* Chat list */}
        <aside className="hidden md:flex flex-col gap-3 pop-card p-4 overflow-hidden">
          <h2 className="font-display text-xl font-extrabold italic uppercase text-glitch-soft">
            Squad Chats
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search friends..."
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-high border border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1 scrollbar-hide">
            {chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all ${
                  activeId === c.id
                    ? "bg-primary/10 border-2 border-primary pop-shadow-pink"
                    : "border-2 border-transparent hover:bg-surface-high"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img src={c.img} alt={c.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" width={44} height={44} />
                    {c.active && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-extrabold tracking-wider text-sm truncate">{c.name}</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.preview}</p>
                    {c.location && (
                      <div className={`mt-1 flex items-center gap-1 text-[10px] font-bold uppercase ${c.active ? "text-primary" : "text-secondary"}`}>
                        {c.active ? <Navigation className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {c.location}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation */}
        <section className="flex flex-col pop-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={active.img} alt={active.name} className="h-10 w-10 rounded-full object-cover" width={40} height={40} />
              <div>
                <div className="font-display font-extrabold tracking-wider">{active.name}</div>
                {active.location && (
                  <div className="flex items-center gap-1 text-xs text-primary font-bold uppercase">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    {active.location} · 500m
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Video call" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-high hover:bg-surface">
                <Video className="h-5 w-5" />
              </button>
              <button aria-label="More" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-high hover:bg-surface">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}>
                {m.sticker ? (
                  <div className="rounded-2xl border-2 border-primary p-1 bg-background pop-shadow-pink">
                    <img src={m.sticker} alt="sticker" className="h-32 w-32 rounded-xl object-cover" />
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl ${
                      m.from === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm font-medium"
                        : "bg-surface-high text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {m.time}{m.from === "me" && m.read ? " · Read" : ""}
                </span>
              </div>
            ))}
            {typing && (
              <div className="flex justify-center">
                <span className="px-3 py-1.5 rounded-full bg-surface-high text-xs font-display font-bold uppercase tracking-widest text-muted-foreground">
                  {active.name} is typing…
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 md:p-4 space-y-3">
            <div className="flex items-center gap-2">
              <button className="h-11 w-11 grid place-items-center rounded-full bg-surface-high text-primary hover:bg-surface">
                <Plus className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="w-full h-11 pl-4 pr-11 rounded-full bg-surface-high border border-border focus:border-primary outline-none"
                />
                <Smile className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              </div>
              <button
                onClick={send}
                aria-label="Send"
                className="h-11 w-11 grid place-items-center rounded-2xl bg-primary text-primary-foreground pop-shadow-pink hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {stickerEmojis.map((e, i) => (
                <button
                  key={i}
                  onClick={() => sendSticker(e)}
                  className={`shrink-0 h-12 w-12 grid place-items-center rounded-xl text-2xl border ${
                    e === "+" ? "border-2 border-dashed border-muted-foreground" : "border-border bg-surface-high hover:border-primary hover:bg-primary/5"
                  } transition-colors`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Profile panel */}
        <aside className="hidden lg:flex flex-col pop-card p-5 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary animate-spin-slow" style={{ animationDuration: "12s" }} />
              <img src={active.img} alt={active.name} className="relative h-28 w-28 rounded-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-extrabold italic">{active.name}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mt-1">
                Digital Nomad / Rogue Artist
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Vibe</div>
            <div className="rounded-2xl border-2 border-primary p-4 italic text-sm">
              "Lost in the neon static… catching glitches in the matrix."
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shared Pix</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square rounded-xl gradient-vibe" />
              <div className="aspect-square rounded-xl gradient-brand" />
              <div className="aspect-square rounded-xl bg-secondary/40" />
              <div className="aspect-square rounded-xl bg-surface-high grid place-items-center font-display font-extrabold text-muted-foreground">
                +24
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-2">
            <button className="w-full py-3 rounded-full border-2 border-primary text-primary font-display font-extrabold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors">
              View profile
            </button>
            <button className="w-full py-2 text-secondary font-display font-bold uppercase tracking-wider text-sm hover:text-secondary/80">
              Block user
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
