"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string }
  | { role: "system-note"; text: string };

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isStreaming: boolean;
  sixActive: boolean;
};

export function ChatColumn({ messages, onSend, isStreaming, sixActive }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 160);
    el.style.height = `${next}px`;
  }, [input]);

  const handleSend = () => {
    const t = input.trim();
    if (!t || isStreaming) return;
    onSend(t);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative flex h-full flex-1 flex-col border-x border-spy-line/40 bg-claude-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-spy-line/30 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-sm border border-spy-gold/35 bg-spy-gold/10 font-mono-spy text-xs font-medium tracking-wider text-spy-gold">
            006
          </div>
          <div>
            <div className="text-sm font-medium text-claude-text">Asset · spending agent</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-claude-muted">
              cover identity active
            </div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono-spy text-[9px] uppercase tracking-wider transition-all duration-200 ${
            sixActive
              ? "border-spy-gold/45 bg-spy-gold/12 text-spy-gold"
              : "border-spy-line bg-spy-panel/50 text-claude-muted"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
              sixActive ? "bg-spy-gold spy-pulse" : "bg-claude-muted/50"
            }`}
          />
          006 {sixActive ? "engaged" : "on watch"}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto spy-scroll">
        <div className="mx-auto flex max-w-[680px] flex-col gap-5 px-6 py-8">
          {messages.length === 0 && <EmptyState />}

          {messages.map((m, i) => (
            <Message key={i} m={m} />
          ))}

          {isStreaming && <TypingIndicator />}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-spy-line/30 px-6 py-4">
        <div className="mx-auto max-w-[680px]">
          <div className="flex items-end gap-2 rounded-sm border border-spy-line bg-spy-panel/60 px-3 py-2.5 shadow-lg shadow-black/30 transition-colors duration-150 focus-within:border-spy-gold/30">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Transmit spend instruction…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent px-2 py-1 text-[14.5px] leading-snug text-claude-text placeholder:text-claude-muted/60 focus:outline-none disabled:opacity-50"
              style={{ minHeight: "28px", overflow: "hidden" }}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-spy-gold text-spy-bg transition-all duration-150 hover:bg-amber-400 active:scale-95 disabled:bg-claude-muted/30 disabled:text-spy-muted"
              aria-label="Transmit"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-center font-mono-spy text-[9.5px] uppercase tracking-wider text-claude-muted/70">
            006 field demo · transmissions logged to trace only
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 flex flex-col items-center gap-4 text-center fade-in">
      <div className="grid h-14 w-14 place-items-center rounded-sm border border-spy-gold/35 bg-spy-gold/8 font-mono-spy text-xl tracking-widest text-spy-gold">
        006
      </div>
      <div className="space-y-1">
        <div className="text-lg font-medium tracking-tight text-claude-text">
          Issue a spend directive to the asset.
        </div>
        <div className="text-[13px] text-claude-muted leading-relaxed">
          006 intercepts every wire before it clears.
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center gap-1 font-mono-spy text-[10px] uppercase tracking-wider text-spy-muted/60">
        <span>Pick a mission scenario in the sidebar</span>
        <span>or transmit your own directive below.</span>
      </div>
      <div className="mt-4 h-px w-16 bg-spy-gold/20" />
      <div className="font-mono-spy text-[10px] uppercase tracking-wider text-spy-muted/40">
        Awaiting asset contact…
      </div>
    </div>
  );
}

function Message({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end fade-in">
        <div className="max-w-[80%] rounded-sm border border-spy-line/60 bg-claude-bubble px-4 py-2.5 text-[14.5px] leading-relaxed text-claude-text">
          {m.text}
        </div>
      </div>
    );
  }
  if (m.role === "system-note") {
    return (
      <div className="flex justify-center fade-in">
        <div className="rounded-sm border border-spy-gold/20 bg-spy-gold/5 px-3 py-1.5 font-mono-spy text-[9.5px] uppercase tracking-wider text-spy-gold/80">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 fade-in">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-spy-gold/30 bg-spy-gold/10 font-mono-spy text-[9px] font-medium text-spy-gold">
        006
      </div>
      <div className="flex-1 whitespace-pre-wrap text-[14.5px] leading-relaxed text-claude-text">
        {m.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-spy-gold/30 bg-spy-gold/10 font-mono-spy text-[9px] text-spy-gold">
        006
      </div>
      <div className="flex items-center pt-1.5">
        <span className="claude-dot" />
        <span className="claude-dot" />
        <span className="claude-dot" />
      </div>
    </div>
  );
}
