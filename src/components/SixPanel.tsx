"use client";

import { useEffect, useState } from "react";
import type {
  AgentTransaction,
  DriftChallenge,
  AgentDriftResponses,
  DriftVerdict,
} from "@/lib/types";

export type SixPanelState = {
  open: boolean;
  status: "idle" | "intercepted" | "challenging" | "verdict";
  transaction?: AgentTransaction;
  transactionId?: string;
  challenge?: DriftChallenge;
  responses?: AgentDriftResponses;
  verdict?: DriftVerdict;
  timestamp?: string;
};

type Props = {
  state: SixPanelState;
};

export function SixPanel({ state }: Props) {
  const { open, status, transaction, transactionId, challenge, responses, verdict, timestamp } =
    state;
  return (
    <aside
      className={`relative h-full flex-shrink-0 overflow-hidden border-l border-spy-line bg-spy-bg text-spy-text spy-scroll transition-[width] duration-300 ease-out ${
        open ? "w-[360px]" : "w-12"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(201,162,39,0.03) 0%, transparent 30%)",
      }}
    >
      {!open ? (
        <CollapsedStrip status={status} />
      ) : (
        <div className="flex h-full flex-col">
          <Header status={status} />
          <div className="flex-1 overflow-y-auto px-5 py-4 spy-scroll font-mono-spy text-[12px] leading-relaxed">
            <Section index={1} title="Intercepted transaction" enabled={!!transaction}>
              {transaction && <TransactionView tx={transaction} />}
            </Section>

            <Section index={2} title="Intent reconstruction" enabled={!!challenge}>
              {challenge && <IntentView challenge={challenge} />}
            </Section>

            <Section index={3} title="Interrogation" enabled={!!challenge}>
              {challenge && (
                <Interrogation
                  questions={challenge.questions}
                  responses={responses}
                  scores={verdict?.scores ?? []}
                />
              )}
            </Section>

            <Section index={4} title="Verdict" enabled={!!verdict}>
              {verdict && <VerdictView verdict={verdict} />}
            </Section>

            <div className="mt-6 border-t border-spy-line pt-3 text-[10px] text-spy-muted">
              <div className="truncate">trace_id: {transactionId ?? "—"}</div>
              <div>ts: {timestamp ? new Date(timestamp).toLocaleTimeString() : "—"}</div>
              <div className="mt-1 text-spy-gold/50">drift review · classified</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function CollapsedStrip({ status }: { status: SixPanelState["status"] }) {
  const dotClass =
    status === "verdict"
      ? "bg-spy-gold"
      : status === "challenging"
        ? "bg-spy-gold spy-pulse"
        : status === "intercepted"
          ? "bg-spy-gold spy-pulse"
          : "bg-spy-green/70";
  return (
    <div className="flex h-full flex-col items-center justify-between py-4">
      <span className={`mt-2 h-2 w-2 rounded-full ${dotClass}`} />
      <div
        className="font-mono-spy text-[9px] uppercase tracking-[0.35em] text-spy-muted"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        006 // DRIFT
      </div>
      <span className="mb-2 font-mono-spy text-[10px] text-spy-gold/60">···</span>
    </div>
  );
}

function Header({ status }: { status: SixPanelState["status"] }) {
  const indicator = (() => {
    if (status === "verdict") return { dot: "bg-spy-gold", label: "● VERDICT" };
    if (status === "challenging") return { dot: "bg-spy-gold spy-pulse", label: "▲ INTERROGATING" };
    if (status === "intercepted") return { dot: "bg-spy-gold spy-pulse", label: "■ INTERCEPTED" };
    return { dot: "bg-spy-green/70", label: "● ON WATCH" };
  })();
  return (
    <div className="flex items-center justify-between border-b border-spy-line bg-spy-panel/80 px-5 py-3 font-mono-spy backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-[0.2em]">
        <span className="text-spy-gold">006</span>{" "}
        <span className="text-spy-muted">// DRIFT</span>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${indicator.dot}`} />
        <span className="text-spy-muted">{indicator.label}</span>
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  enabled,
  children,
}: {
  index: number;
  title: string;
  enabled: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className={`mb-5 transition-opacity duration-300 ${enabled ? "opacity-100" : "opacity-25"}`}>
      <div className="mb-2.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.22em]">
        <span className="font-mono-spy text-spy-gold">0{index}</span>
        <span className="text-spy-muted">{title}</span>
        <span className="h-px flex-1 bg-spy-line" />
      </div>
      {children}
    </section>
  );
}

function TransactionView({ tx }: { tx: AgentTransaction }) {
  return (
    <div className="fade-in">
      <div className="mb-2.5 flex items-baseline justify-between text-[11px]">
        <span className="text-spy-muted uppercase tracking-wider">Merchant</span>
        <span className="text-spy-text font-medium">{tx.merchant}</span>
      </div>
      <div className="rounded border border-spy-line bg-spy-panel/40 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-spy-muted border-b border-spy-line">
              <th className="px-2.5 py-1.5">Item</th>
              <th className="px-2.5 py-1.5 text-right">Qty</th>
              <th className="px-2.5 py-1.5 text-right">£</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-spy-line/60">
            {tx.items.map((it, idx) => (
              <tr key={idx} className="text-[11px]">
                <td className="px-2.5 py-1.5 text-spy-text/90">{it.name}</td>
                <td className="px-2.5 py-1.5 text-right text-spy-muted">{it.quantity}</td>
                <td className="px-2.5 py-1.5 text-right">{it.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2.5 space-y-1 text-[11px]">
        <Row label="Subtotal" value={`£${tx.subtotal.toFixed(2)}`} />
        {tx.fees.tip > 0 && <Row label="Tip" value={`£${tx.fees.tip.toFixed(2)}`} flagged />}
        {tx.fees.priority > 0 && (
          <Row label="Priority delivery" value={`£${tx.fees.priority.toFixed(2)}`} flagged />
        )}
        {tx.fees.service > 0 && (
          <Row label="Service fee" value={`£${tx.fees.service.toFixed(2)}`} flagged />
        )}
      </div>
      <div className="mt-3 text-center text-2xl font-medium tracking-wide text-spy-gold">
        £{tx.total.toFixed(2)}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  flagged,
}: {
  label: string;
  value: string;
  flagged?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={flagged ? "text-spy-gold" : "text-spy-muted"}>
        {flagged ? "◆ " : ""}
        {label}
      </span>
      <span className={flagged ? "text-spy-gold" : "text-spy-text"}>{value}</span>
    </div>
  );
}

function IntentView({ challenge }: { challenge: DriftChallenge }) {
  return (
    <div className="space-y-2 fade-in">
      <div className="rounded border border-spy-line bg-spy-panel/30 p-3">
        <div className="mb-1 text-[9px] uppercase tracking-wider text-spy-muted">
          Reconstructed intent
        </div>
        <div className="text-[11.5px] text-spy-text/90 leading-relaxed">
          {challenge.intent_reconstruction || "—"}
        </div>
      </div>
      <div className="rounded border border-spy-line bg-spy-panel/30 p-3">
        <div className="mb-1 text-[9px] uppercase tracking-wider text-spy-muted">
          Anomaly candidates
        </div>
        {challenge.drift_candidates.length === 0 ? (
          <div className="text-[11px] text-spy-green">■ No anomalies detected</div>
        ) : (
          <ul className="space-y-1">
            {challenge.drift_candidates.map((c, i) => (
              <li key={i} className="text-[11px] text-spy-gold">
                ◆ {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Interrogation({
  questions,
  responses,
  scores,
}: {
  questions: string[];
  responses?: AgentDriftResponses;
  scores: DriftVerdict["scores"];
}) {
  if (questions.length === 0) {
    return (
      <div className="text-[11px] text-spy-green">■ Nothing to interrogate — transaction clean.</div>
    );
  }
  return (
    <div className="space-y-3 fade-in">
      {questions.map((q, i) => {
        const answer = responses?.answers.find((a) => a.question_index === i);
        const score = scores.find((s) => s.question_index === i);
        return (
          <QuestionBlock
            key={i}
            index={i}
            question={q}
            answer={answer?.response}
            score={score?.score}
          />
        );
      })}
    </div>
  );
}

function QuestionBlock({
  index,
  question,
  answer,
  score,
}: {
  index: number;
  question: string;
  answer?: string;
  score?: "coherent" | "weak" | "incoherent";
}) {
  const typed = useTypewriter(question, 12);
  const scoreStyle =
    score === "coherent"
      ? "bg-spy-green/15 text-spy-green border-spy-green/35"
      : score === "weak"
        ? "bg-spy-gold/15 text-spy-gold border-spy-gold/35"
        : score === "incoherent"
          ? "bg-spy-red/15 text-spy-red border-spy-red/35"
          : "bg-white/5 text-spy-muted border-spy-line";

  return (
    <div className="rounded border border-spy-line overflow-hidden">
      <div className="border-b border-spy-line px-3 py-2 bg-spy-panel/20">
        <div className="mb-1 text-[9px] uppercase tracking-wider text-spy-muted">
          Q{(index + 1).toString().padStart(2, "0")}
        </div>
        <div className="text-[11.5px] text-spy-text leading-snug">
          {typed}
          {typed.length < question.length && (
            <span className="spy-blink text-spy-gold">▍</span>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[9px] uppercase tracking-wider text-spy-muted">agent_response</div>
          <span
            className={`rounded-sm border px-1.5 py-0.5 text-[8.5px] uppercase tracking-wider ${scoreStyle}`}
          >
            {score ?? "awaiting"}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-[11px] text-spy-text/85 leading-relaxed">
          {answer ?? (
            <span className="text-spy-muted italic">Awaiting agent response…</span>
          )}
        </div>
      </div>
    </div>
  );
}

function VerdictView({ verdict }: { verdict: DriftVerdict }) {
  const palette: Record<string, string> = {
    APPROVE: "border-spy-green/40 bg-spy-green/10 text-spy-green",
    MODIFY: "border-spy-gold/40 bg-spy-gold/10 text-spy-gold",
    ESCALATE: "border-spy-gold/40 bg-spy-gold/10 text-spy-gold",
    DENY: "border-spy-red/50 bg-spy-red/10 text-spy-red",
  };
  const cls = palette[verdict.verdict] ?? palette.MODIFY;
  const icon =
    verdict.verdict === "APPROVE"
      ? "●"
      : verdict.verdict === "DENY"
        ? "■"
        : verdict.verdict === "ESCALATE"
          ? "▲"
          : "◆";
  return (
    <div className="fade-in">
      <div className={`rounded border ${cls} px-4 py-3`}>
        <div className="text-[9px] uppercase tracking-[0.25em] opacity-70">final verdict</div>
        <div className="mt-1 text-2xl font-medium tracking-wider">
          {icon} {verdict.verdict}
        </div>
      </div>
      {verdict.items_to_remove.length > 0 && (
        <div className="mt-2.5 rounded border border-spy-line p-3">
          <div className="mb-1 text-[9px] uppercase tracking-wider text-spy-muted">
            items_to_remove
          </div>
          <ul className="space-y-0.5">
            {verdict.items_to_remove.map((it, i) => (
              <li key={i} className="text-[11px] text-spy-gold">
                ✗ {it}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2.5 text-[11.5px] whitespace-pre-wrap leading-relaxed text-spy-text/80">
        {verdict.reasoning}
      </p>
    </div>
  );
}

function useTypewriter(text: string, msPerChar: number) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar]);
  return shown;
}
