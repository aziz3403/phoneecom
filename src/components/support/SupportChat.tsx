"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, MessageCircle, Send, X } from "lucide-react";
import {
  useSupportChat,
  botReply,
  newId,
  GREETING,
  QUICK_REPLIES,
  type ChatMessage,
} from "@/lib/support-chat-store";

const ACCENT = "#0a8f6e";

export function SupportChat() {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [teaser, setTeaser] = useState(false);

  const open = useSupportChat((s) => s.open);
  const setOpen = useSupportChat((s) => s.setOpen);
  const messages = useSupportChat((s) => s.messages);
  const push = useSupportChat((s) => s.push);

  const scrollRef = useRef<HTMLDivElement>(null);
  const teasedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // Proactive nudge a few seconds in (once per page visit, if never opened).
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      if (!teasedRef.current && !useSupportChat.getState().open) setTeaser(true);
    }, 4500);
    return () => clearTimeout(t);
  }, [mounted]);

  // Greet on first open.
  useEffect(() => {
    if (open && messages.length === 0 && !typing) {
      setTyping(true);
      const t = setTimeout(() => {
        push({ id: newId(), ...GREETING });
        setTyping(false);
      }, 650);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  if (!mounted) return null;

  function openChat() {
    teasedRef.current = true;
    setTeaser(false);
    setOpen(true);
  }

  function sendText(text: string) {
    const clean = text.trim();
    if (!clean || typing) return;
    push({ id: newId(), role: "user", text: clean });
    setDraft("");
    setTyping(true);
    const reply = botReply(clean);
    const delay = Math.min(1800, 500 + reply.text.length * 14);
    setTimeout(() => {
      push({ id: newId(), role: "agent", text: reply.text, actions: reply.actions });
      setTyping(false);
    }, delay);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendText(draft);
  }

  return (
    <>
      {/* ───── proactive teaser ───── */}
      <AnimatePresence>
        {teaser && !open && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            onClick={openChat}
            className="fixed bottom-[88px] right-5 z-[150] max-w-[260px] rounded-2xl border border-[#e3e3e6] bg-white p-3.5 pr-9 text-left shadow-[0_14px_40px_rgba(20,60,45,.18)]"
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                teasedRef.current = true;
                setTeaser(false);
              }}
              className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full text-[#86868b] hover:bg-[#f1f1f3]"
              aria-hidden
            >
              <X className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13.5px] font-semibold text-[#1d1d1f]">Need a hand? 👋</p>
            <p className="mt-1 text-[13px] leading-snug text-[#6e6e73]">
              Questions about a device, your order or a trade-in? I&apos;m here to help.
            </p>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ───── launcher ───── */}
      <button
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-5 right-5 z-[151] grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_10px_30px_rgba(10,143,110,.45)] transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ background: ACCENT }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ───── panel ───── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            role="dialog"
            aria-label="reMint support chat"
            className="fixed bottom-[88px] right-5 z-[151] flex h-[min(560px,calc(100vh-120px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] border border-[#e3e3e6] bg-white shadow-[0_24px_70px_rgba(20,60,45,.28)]"
          >
            {/* header */}
            <div className="flex items-center gap-3 px-4 py-3.5 text-white" style={{ background: ACCENT }}>
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15">
                <Headset className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a8f6e] bg-[#5ee0b3]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold leading-tight">Remi · reMint Support</div>
                <div className="flex items-center gap-1.5 text-[12px] text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5ee0b3]" /> Online · replies in ~1 min
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#f7f7f8] px-3.5 py-4">
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} onClose={() => setOpen(false)} />
              ))}
              {typing && (
                <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-[#eaeaec] bg-white px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#b5b5ba]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* quick replies */}
            <div className="flex gap-2 overflow-x-auto border-t border-[#eee] bg-white px-3.5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendText(q)}
                  disabled={typing}
                  className="shrink-0 rounded-full border border-[#d2d2d7] px-3 py-1.5 text-[12.5px] font-medium text-[#1d1d1f] transition hover:border-[#0a8f6e] hover:text-[#0a8f6e] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* input */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#eee] bg-white px-3 py-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                aria-label="Type a message"
                className="h-10 flex-1 rounded-full border border-[#d2d2d7] bg-[#f7f7f8] px-4 text-[14px] text-[#1d1d1f] outline-none transition focus:border-[#0a8f6e] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white transition active:scale-95 disabled:opacity-40"
                style={{ background: ACCENT }}
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg, onClose }: { msg: ChatMessage; onClose: () => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={isUser ? "flex justify-end" : "flex justify-start"}
    >
      <div className={isUser ? "max-w-[82%]" : "max-w-[88%]"}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md bg-[#0a8f6e] px-3.5 py-2.5 text-[14px] leading-relaxed text-white"
              : "rounded-2xl rounded-bl-md border border-[#eaeaec] bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-[#1d1d1f]"
          }
        >
          {msg.text}
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.actions.map((a) => (
              <Link
                key={a.href + a.label}
                href={a.href}
                onClick={onClose}
                className="inline-flex items-center rounded-full border border-[#0a8f6e] bg-[#f1f7f3] px-3 py-1.5 text-[12.5px] font-semibold text-[#0a8f6e] transition hover:bg-[#0a8f6e] hover:text-white"
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
