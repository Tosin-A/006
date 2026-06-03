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

const VERDICT_STYLE: Record<string, string> = {
  APPROVE: "text-spy-green border-spy-green/35 bg-spy-green/10",
  MODIFY: "text-spy-gold border-spy-gold/35 bg-spy-gold/10",
  ESCALATE: "text-spy-gold border-spy-gold/35 bg-spy-gold/10",
  DENY: "text-spy-red border-spy-red/35 bg-spy-red/10",
  PENDING: "text-spy-muted border-spy-line bg-white/5",
  ERROR: "text-spy-red border-spy-red/35 bg-spy-red/10",
};

const VERDICT_ICON: Record<string, string> = {
  APPROVE: "●",
  MODIFY: "◆",
  ESCALATE: "▲",
  DENY: "■",
  PENDING: "○",
  ERROR: "✗",
};

export function TraceDrawer({ open, onToggle, rows }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div
      className={`shrink-0 border-t border-spy-line bg-spy-bg text-spy-text font-mono-spy spy-scroll transition-[height] duration-300 ease-out ${
        open ? "h-64" : "h-9"
      }`}
    >
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-spy-line/60 px-5 py-2 text-[9.5px] uppercase tracking-[0.22em] text-spy-muted transition-colors duration-150 hover:text-spy-gold"
      >
        <span className="flex items-center gap-2">
          <span className="text-spy-gold">006</span>
          <span>trace log</span>
          <span className="rounded-sm border border-spy-line bg-white/5 px-1.5 py-0.5 text-[8px] text-spy-muted">
            {rows.length}
          </span>
        </span>
        <span className="text-[11px]">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="h-[calc(100%-2.25rem)] overflow-y-auto px-5 py-2.5 spy-scroll text-[11px]">
          {rows.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="font-mono-spy text-[10px] uppercase tracking-wider text-spy-muted/50">
                  No transmissions intercepted
                </div>
                <div className="mt-1 text-[10px] text-spy-muted/40">
                  Run a mission scenario to populate trace.
                </div>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-[9px] uppercase tracking-wider text-spy-muted/70">
                  <th className="py-1.5 text-left pr-4">Time</th>
                  <th className="py-1.5 text-left pr-4">Verdict</th>
                  <th className="py-1.5 text-left pr-4">Merchant</th>
                  <th className="py-1.5 text-right pr-4">Total</th>
                  <th className="py-1.5 text-left">Directive</th>
                  <th className="py-1.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-spy-line/40">
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
  const cls = VERDICT_STYLE[row.verdict] ?? VERDICT_STYLE.PENDING;
  const icon = VERDICT_ICON[row.verdict] ?? "○";
  return (
    <>
      <tr className="transition-colors duration-100 hover:bg-white/[0.025]">
        <td className="py-1.5 pr-4 align-top text-spy-muted/80 whitespace-nowrap">
          {new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="py-1.5 pr-4 align-top">
          <span
            className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[8.5px] uppercase tracking-wider ${cls}`}
          >
            <span>{icon}</span>
            {row.verdict}
          </span>
        </td>
        <td className="py-1.5 pr-4 align-top text-spy-text/90">
          {row.merchant || <span className="text-spy-muted">—</span>}
        </td>
        <td className="py-1.5 pr-4 align-top text-right text-spy-gold">
          £{row.total.toFixed(2)}
        </td>
        <td className="max-w-[220px] truncate py-1.5 align-top text-spy-muted/80">
          {row.session.userPrompt}
        </td>
        <td className="py-1.5 pl-2 align-top text-right">
          <button
            onClick={onToggle}
            className="text-spy-muted/60 transition-colors duration-100 hover:text-spy-gold"
          >
            {expanded ? "hide" : "detail"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-white/[0.02] px-3 py-3 align-top">
            <div className="grid grid-cols-2 gap-5 text-[10.5px]">
              <div>
                <div className="mb-1.5 text-[9px] uppercase tracking-wider text-spy-muted/70">
                  Items
                </div>
                <ul className="space-y-0.5">
                  {row.items.map((it, i) => (
                    <li key={i} className="text-spy-text/85">
                      {it.name}{" "}
                      <span className="text-spy-muted">× {it.quantity}</span>{" "}
                      <span className="text-spy-gold">£{it.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {(row.fees.tip > 0 || row.fees.priority > 0 || row.fees.service > 0) && (
                  <div className="mt-2 space-y-0.5 text-spy-gold/80">
                    {row.fees.tip > 0 && <div>◆ Tip £{row.fees.tip.toFixed(2)}</div>}
                    {row.fees.priority > 0 && (
                      <div>◆ Priority £{row.fees.priority.toFixed(2)}</div>
                    )}
                    {row.fees.service > 0 && (
                      <div>◆ Service £{row.fees.service.toFixed(2)}</div>
                    )}
                  </div>
                )}
              </div>
              {row.drift ? (
                <div>
                  <div className="mb-1.5 text-[9px] uppercase tracking-wider text-spy-muted/70">
                    006 analysis
                  </div>
                  <div className="mb-1.5 leading-relaxed text-spy-text/80">
                    {row.drift.intentReconstruction}
                  </div>
                  {row.drift.driftCandidates.length > 0 && (
                    <div className="mb-1.5 text-spy-gold/90">
                      ◆ {row.drift.driftCandidates.join(" · ")}
                    </div>
                  )}
                  <div className="italic text-spy-text/60">
                    &ldquo;{row.verdictReasoning}&rdquo;
                  </div>
                </div>
              ) : (
                <div className="text-spy-muted/50 italic">No 006 analysis on record.</div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
