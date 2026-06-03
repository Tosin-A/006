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
  const { open, status, transaction, transactionId, challenge, responses, verdict, timestamp } = state;
  return (
    <aside
      className={`relative h-full flex-shrink-0 overflow-hidden border-l border-spy-line bg-spy-bg text-spy-text spy-scroll transition-[width] duration-300 ease-out ${
        open ? "w-[520px]" : "w-12"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(201,162,39,0.04) 0%, transparent 28%), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 24px 100%",
      }}
    >
      {!open ? (
        <CollapsedStrip status={status} />
      ) : (
        <div className="flex h-full flex-col">
          <Header status={status} />
          <div className="flex-1 overflow-y-auto px-5 py-4 font-mono-spy text-[12.5px] leading-relaxed">
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
              <div>trace_id: {transactionId ?? "—"}</div>
              <div>ts: {timestamp ?? "—"}</div>
              <div className="mt-1 text-spy-gold/60">clearance · field ops</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function CollapsedStrip({ status }: { status: SixPanelState["status"] }) {
  const color =
    status === "verdict"
      ? "bg-spy-gold"
      : status === "challenging"
        ? "bg-spy-gold spy-pulse"
        : status === "intercepted"
          ? "bg-spy-gold spy-pulse"
          : "bg-spy-green spy-pulse";
  return (
    <div className="flex h-full flex-col items-center justify-between py-4">
      <span className={`mt-2 h-2 w-2 rounded-full ${color}`} />
      <div
        className="font-mono-spy text-[10px] uppercase tracking-[0.3em] text-spy-muted"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        006 // FIELD OPS
      </div>
      <span className="mb-2 font-mono-spy text-[10px] text-spy-gold">···</span>
    </div>
  );
}

function Header({ status }: { status: SixPanelState["status"] }) {
  const indicator = (() => {
    if (status === "verdict") return { color: "bg-spy-gold", label: "verdict" };
    if (status === "challenging") return { color: "bg-spy-gold spy-pulse", label: "interrogating" };
    if (status === "intercepted") return { color: "bg-spy-gold spy-pulse", label: "intercepted" };
    return { color: "bg-spy-green spy-pulse", label: "on watch" };
  })();
  return (
    <div className="flex items-center justify-between border-b border-spy-line bg-spy-panel/80 px-5 py-3 font-mono-spy backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-[0.25em] text-spy-text">
        <span className="text-spy-gold">006</span>{" "}
        <span className="text-spy-muted">// FIELD OPERATIONS</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-spy-muted">
        <span className={`inline-block h-2 w-2 rounded-full ${indicator.color}`} />
        {indicator.label}
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
    <section className={`mb-6 ${enabled ? "" : "opacity-30"}`}>
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-spy-muted">
        <span className="font-mono-spy text-spy-gold">0{index}</span>
        <span>{title}</span>
        <span className="flex-1 border-b border-spy-line" />
      </div>
      {children}
    </section>
  );
}

function TransactionView({ tx }: { tx: AgentTransaction }) {
  const verdictColorTotal = tx.total > 0 ? "text-spy-text" : "text-spy-muted";
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-spy-muted">MERCHANT</span>
        <span>{tx.merchant}</span>
      </div>
      <div className="rounded border border-spy-line bg-spy-panel/40">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-spy-muted">
              <th className="px-2 py-1.5">Item</th>
              <th className="px-2 py-1.5 text-right">Qty</th>
              <th className="px-2 py-1.5 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-spy-line">
            {tx.items.map((i, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1.5">{i.name}</td>
                <td className="px-2 py-1.5 text-right text-spy-muted">{i.quantity}</td>
                <td className="px-2 py-1.5 text-right">£{i.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 space-y-1 text-[11px]">
        <Row label="Subtotal" value={`£${tx.subtotal.toFixed(2)}`} />
        {tx.fees.tip > 0 && <Row label="Tip" value={`£${tx.fees.tip.toFixed(2)}`} flagged />}
        {tx.fees.priority > 0 && <Row label="Priority" value={`£${tx.fees.priority.toFixed(2)}`} flagged />}
        {tx.fees.service > 0 && <Row label="Service" value={`£${tx.fees.service.toFixed(2)}`} flagged />}
      </div>
      <div className={`mt-4 text-center text-3xl font-medium tracking-wide text-spy-gold ${verdictColorTotal}`}>
        £{tx.total.toFixed(2)}
      </div>
    </div>
  );
}

function Row({ label, value, flagged }: { label: string; value: string; flagged?: boolean }) {
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
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded border border-spy-line bg-spy-panel/30 p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-spy-muted">
          006 // reconstructed
        </div>
        <div>{challenge.intent_reconstruction || "—"}</div>
      </div>
      <div className="rounded border border-spy-line bg-spy-panel/30 p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-spy-muted">006 // anomalies</div>
        {challenge.drift_candidates.length === 0 ? (
          <div className="text-spy-green">No anomalies detected.</div>
        ) : (
          <ul className="space-y-0.5">
            {challenge.drift_candidates.map((c, i) => (
              <li key={i} className="text-spy-gold">
                · {c}
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
    return <div className="text-spy-green">Nothing to interrogate.</div>;
  }
  return (
    <div className="space-y-4">
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
  const scoreColor =
    score === "coherent"
      ? "bg-spy-green/20 text-spy-green border-spy-green/40"
      : score === "weak"
        ? "bg-spy-gold/20 text-spy-gold border-spy-gold/40"
        : score === "incoherent"
          ? "bg-spy-red/20 text-spy-red border-spy-red/40"
          : "bg-white/5 text-spy-muted border-spy-line";

  return (
    <div className="rounded border border-spy-line">
      <div className="border-b border-spy-line px-3 py-2">
        <div className="mb-0.5 text-[10px] uppercase tracking-wider text-spy-muted">
          Q{(index + 1).toString().padStart(2, "0")}
        </div>
        <div className="text-spy-text">
          {typed}
          {typed.length < question.length && <span className="spy-blink text-spy-gold">▍</span>}
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider text-spy-muted">agent_response</div>
          <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${scoreColor}`}>
            {score ?? "awaiting"}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-spy-text/90">
          {answer ?? <span className="text-spy-muted">awaiting agent…</span>}
        </div>
      </div>
    </div>
  );
}

function VerdictView({ verdict }: { verdict: DriftVerdict }) {
  const palette = {
    APPROVE: "border-spy-green/50 bg-spy-green/10 text-spy-green",
    MODIFY: "border-spy-gold/50 bg-spy-gold/10 text-spy-gold",
    ESCALATE: "border-spy-gold/50 bg-spy-gold/10 text-spy-gold",
    DENY: "border-spy-red/60 bg-spy-red/10 text-spy-red",
  } as const;
  const cls = palette[verdict.verdict];
  return (
    <div>
      <div className={`rounded border ${cls} px-4 py-3`}>
        <div className="text-[10px] uppercase tracking-[0.25em] text-current/70">final verdict</div>
        <div className="mt-1 text-3xl font-medium tracking-wider">{verdict.verdict}</div>
      </div>
      {verdict.items_to_remove.length > 0 && (
        <div className="mt-3 rounded border border-spy-line p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-spy-muted">
            items_to_remove
          </div>
          <ul className="space-y-0.5">
            {verdict.items_to_remove.map((it, i) => (
              <li key={i} className="text-spy-gold">
                ✗ {it}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 whitespace-pre-wrap text-spy-text/85">{verdict.reasoning}</p>
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
