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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = () => {
    const t = input.trim();
    if (!t || isStreaming) return;
    onSend(t);
    setInput("");
  };

  return (
    <div className="relative flex h-full flex-1 flex-col border-x border-spy-line/40 bg-claude-bg">
      <header className="flex items-center justify-between border-b border-spy-line/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-sm border border-spy-gold/30 bg-spy-gold/10 font-mono-spy text-xs font-medium tracking-wider text-spy-gold">
            006
          </div>
          <div>
            <div className="text-sm font-medium text-claude-text">Asset · spending agent</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-claude-muted">cover identity active</div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono-spy text-[10px] uppercase tracking-wider transition-colors ${
            sixActive
              ? "border-spy-gold/50 bg-spy-gold/15 text-spy-gold"
              : "border-spy-line bg-spy-panel/50 text-claude-muted"
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              sixActive ? "bg-spy-gold spy-pulse" : "bg-claude-muted/60"
            }`}
          />
          006 {sixActive ? "engaged" : "on watch"}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-8">
          {messages.length === 0 && (
            <div className="mt-24 flex flex-col items-center gap-3 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-sm border border-spy-gold/40 bg-spy-gold/10 font-mono-spy text-lg tracking-widest text-spy-gold">
                006
              </div>
              <div className="text-xl font-medium tracking-tight text-claude-text">
                Issue a spend directive to the asset.
              </div>
              <div className="max-w-sm text-sm text-claude-muted">
                Pick a mission scenario on the left, or type your own instruction below. The agent
                will plan a transaction. 006 intercepts every wire.
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Message key={i} m={m} />
          ))}

          {isStreaming && <TypingIndicator />}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mx-auto max-w-[720px]">
          <div className="flex items-end gap-2 rounded-sm border border-spy-line bg-spy-panel/60 px-3 py-2.5 shadow-lg shadow-black/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Transmit spend instruction..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-snug text-claude-text placeholder:text-claude-muted/70 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="grid h-8 w-8 place-items-center rounded-sm bg-spy-gold text-spy-bg transition hover:bg-amber-400 disabled:bg-claude-muted/40"
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-center font-mono-spy text-[10px] uppercase tracking-wider text-claude-muted">
            006 field demo · messages logged to trace only
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-sm border border-spy-line/50 bg-claude-bubble px-4 py-2.5 text-[15px] text-claude-text">
          {m.text}
        </div>
      </div>
    );
  }
  if (m.role === "system-note") {
    return (
      <div className="flex justify-center">
        <div className="rounded-sm border border-spy-gold/20 bg-spy-gold/5 px-3 py-1 font-mono-spy text-[10px] uppercase tracking-wider text-spy-gold/90">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-spy-gold/30 bg-spy-gold/10 text-[10px] font-medium text-spy-gold">
        A
      </div>
      <div className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-claude-text">
        {m.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-spy-gold/30 bg-spy-gold/10 text-[10px] text-spy-gold">
        A
      </div>
      <div className="flex items-center pt-2">
        <span className="claude-dot" />
        <span className="claude-dot" />
        <span className="claude-dot" />
      </div>
    </div>
  );
}
