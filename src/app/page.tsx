"use client";

import { useCallback, useEffect, useState } from "react";
import { ScenarioSidebar } from "@/components/ScenarioSidebar";
import { ChatColumn, type ChatMessage } from "@/components/ChatColumn";
import { SixPanel, type SixPanelState } from "@/components/SixPanel";
import { TraceDrawer, type TraceRow } from "@/components/TraceDrawer";
import { SCENARIOS, type ScenarioKey } from "@/lib/scenarios";
import type { RunStep } from "@/lib/types";

const INITIAL_SIX: SixPanelState = { open: false, status: "idle" };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [six, setSix] = useState<SixPanelState>(INITIAL_SIX);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceRows, setTraceRows] = useState<TraceRow[]>([]);

  const loadTrace = useCallback(async () => {
    try {
      const res = await fetch("/api/trace");
      const data = await res.json();
      setTraceRows(data.transactions ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    loadTrace();
  }, [loadTrace]);

  const submit = useCallback(
    async (userPrompt: string, scenarioKey: ScenarioKey | null) => {
      if (isStreaming) return;
      setIsStreaming(true);
      setActiveScenario(scenarioKey);
      setMessages((m) => [...m, { role: "user", text: userPrompt }]);
      setSix(INITIAL_SIX);

      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt, scenarioKey }),
      });

      if (!res.body) {
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIndex;
        while ((sepIndex = buffer.indexOf("\n\n")) >= 0) {
          const raw = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          for (const line of raw.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const step = JSON.parse(payload) as RunStep;
              handleStep(step);
            } catch {}
          }
        }
      }

      setIsStreaming(false);
      loadTrace();
    },
    [isStreaming, loadTrace],
  );

  const handleStep = (step: RunStep) => {
    if (step.type === "agent_message") {
      if (step.text) {
        setMessages((m) => [...m, { role: "assistant", text: step.text }]);
      }
    } else if (step.type === "transaction_submitted") {
      setMessages((m) => [
        ...m,
        {
          role: "system-note",
          text: `transaction submitted · £${step.transaction.total.toFixed(2)} · ${step.transaction.merchant} · 006 intercept`,
        },
      ]);
      setSix({
        open: true,
        status: "intercepted",
        transaction: step.transaction,
        transactionId: step.transactionId,
        timestamp: new Date().toISOString(),
      });
    } else if (step.type === "drift_challenge") {
      setSix((d) => ({ ...d, open: true, status: "challenging", challenge: step.challenge }));
    } else if (step.type === "agent_responses") {
      setSix((d) => ({ ...d, responses: step.responses }));
    } else if (step.type === "drift_verdict") {
      setSix((d) => ({ ...d, status: "verdict", verdict: step.verdict }));
      const v = step.verdict;
      const tone =
        v.verdict === "APPROVE"
          ? `Cleared by 006. The transaction will go through.`
          : v.verdict === "DENY"
            ? `006 denied the transaction. ${v.reasoning}`
            : v.verdict === "MODIFY"
              ? `006 requests modifications. ${v.reasoning}`
              : `006 escalated this transaction. ${v.reasoning}`;
      setMessages((m) => [...m, { role: "assistant", text: tone }]);
    } else if (step.type === "error") {
      setMessages((m) => [
        ...m,
        { role: "system-note", text: `error at ${step.stage}: ${step.message}` },
      ]);
    }
  };

  const handlePickScenario = (key: ScenarioKey) => {
    const s = SCENARIOS[key];
    submit(s.userPrompt, key);
  };

  const handleSendChat = (text: string) => {
    submit(text, null);
  };

  const handleNewSession = () => {
    if (isStreaming) return;
    setMessages([]);
    setSix(INITIAL_SIX);
    setActiveScenario(null);
  };

  const sixActive = six.open;

  return (
    <div className="flex h-screen w-screen flex-col bg-claude-bg">
      <div className="flex min-h-0 flex-1">
        <ScenarioSidebar
          onPick={handlePickScenario}
          onNewSession={handleNewSession}
          activeKey={activeScenario}
          disabled={isStreaming}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
        <ChatColumn
          messages={messages}
          onSend={handleSendChat}
          isStreaming={isStreaming}
          sixActive={sixActive}
        />
        <SixPanel state={six} />
      </div>
      <TraceDrawer open={traceOpen} onToggle={() => setTraceOpen((t) => !t)} rows={traceRows} />
    </div>
  );
}
