"use client";

import { useState } from "react";

export type TraceRow = {
  id: string;
  merchant: string;
  total: number;
  verdict: string;
  verdictReasoning: string;
  createdAt: string;
  items: { name: string; price: number; quantity: number }[];
  fees: { tip: number; priority: number; service: number };
  session: { userPrompt: string; scenarioKey: string | null };
  drift: {
    intentReconstruction: string;
    driftCandidates: string[];
    questions: string[];
    agentResponses: { question_index: number; response: string }[];
    scores: { question_index: number; score: string; note: string }[];
  } | null;
};

type Props = {
  open: boolean;
  onToggle: () => void;
  rows: TraceRow[];
};

const VERDICT_COLOR: Record<string, string> = {
  APPROVE: "text-spy-green border-spy-green/40 bg-spy-green/10",
  MODIFY: "text-spy-gold border-spy-gold/40 bg-spy-gold/10",
  ESCALATE: "text-spy-gold border-spy-gold/40 bg-spy-gold/10",
  DENY: "text-spy-red border-spy-red/40 bg-spy-red/10",
  PENDING: "text-spy-muted border-spy-line bg-white/5",
  ERROR: "text-spy-red border-spy-red/40 bg-spy-red/10",
};

export function TraceDrawer({ open, onToggle, rows }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div
      className={`shrink-0 border-t border-spy-line bg-spy-bg text-spy-text font-mono-spy spy-scroll transition-[height] duration-300 ${
        open ? "h-72" : "h-9"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-spy-line px-5 py-2 text-[10px] uppercase tracking-[0.25em] text-spy-muted hover:text-spy-gold"
      >
        <span>
          <span className="text-spy-gold">006</span> trace log · {rows.length} transaction
          {rows.length === 1 ? "" : "s"}
        </span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="h-[calc(100%-2.25rem)] overflow-y-auto px-5 py-3 text-[11.5px]">
          {rows.length === 0 ? (
            <div className="text-spy-muted">No transactions yet. Run a mission scenario.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-[9.5px] uppercase tracking-wider text-spy-muted">
                  <th className="py-1 text-left">ts</th>
                  <th className="py-1 text-left">verdict</th>
                  <th className="py-1 text-left">merchant</th>
                  <th className="py-1 text-right">total</th>
                  <th className="py-1 text-left">prompt</th>
                  <th className="py-1" />
                </tr>
              </thead>
              <tbody className="divide-y divide-spy-line">
                {rows.map((r) => (
                  <RowView
                    key={r.id}
                    row={r}
                    expanded={expanded === r.id}
                    onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function RowView({
  row,
  expanded,
  onToggle,
}: {
  row: TraceRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cls = VERDICT_COLOR[row.verdict] ?? VERDICT_COLOR.PENDING;
  return (
    <>
      <tr className="hover:bg-white/[0.02]">
        <td className="py-1.5 align-top text-spy-muted">
          {new Date(row.createdAt).toLocaleTimeString()}
        </td>
        <td className="py-1.5 align-top">
          <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${cls}`}>
            {row.verdict}
          </span>
        </td>
        <td className="py-1.5 align-top">{row.merchant || "—"}</td>
        <td className="py-1.5 align-top text-right text-spy-gold">£{row.total.toFixed(2)}</td>
        <td className="max-w-md truncate py-1.5 align-top text-spy-muted">{row.session.userPrompt}</td>
        <td className="py-1.5 align-top text-right">
          <button onClick={onToggle} className="text-spy-muted hover:text-spy-gold">
            {expanded ? "hide" : "expand"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-white/[0.02] px-3 py-3 align-top">
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <div className="mb-1 text-[9.5px] uppercase tracking-wider text-spy-muted">items</div>
                <ul className="space-y-0.5">
                  {row.items.map((it, i) => (
                    <li key={i}>
                      {it.name} · x{it.quantity} · £{it.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-spy-muted">
                  fees · tip £{row.fees.tip.toFixed(2)} · priority £{row.fees.priority.toFixed(2)} · service £
                  {row.fees.service.toFixed(2)}
                </div>
              </div>
              {row.drift && (
                <div>
                  <div className="mb-1 text-[9.5px] uppercase tracking-wider text-spy-muted">006 analysis</div>
                  <div className="mb-2 text-spy-text/85">{row.drift.intentReconstruction}</div>
                  {row.drift.driftCandidates.length > 0 && (
                    <div className="text-spy-gold">
                      anomalies: {row.drift.driftCandidates.join(", ")}
                    </div>
                  )}
                  <div className="mt-2 text-spy-text/80 italic">"{row.verdictReasoning}"</div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
