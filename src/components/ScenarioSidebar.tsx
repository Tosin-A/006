"use client";

import { SCENARIOS, type ScenarioKey } from "@/lib/scenarios";

type Props = {
  onPick: (key: ScenarioKey) => void;
  onNewSession: () => void;
  activeKey: ScenarioKey | null;
  disabled: boolean;
  collapsed: boolean;
  onToggle: () => void;
};

export function ScenarioSidebar({
  onPick,
  onNewSession,
  activeKey,
  disabled,
  collapsed,
  onToggle,
}: Props) {
  return (
    <aside
      className={`flex flex-col border-r border-spy-line bg-spy-bg transition-[width] duration-300 ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-spy-line px-3 py-3">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="grid h-7 w-7 place-items-center rounded-sm text-spy-muted hover:bg-white/5 hover:text-spy-text"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="9" y1="4" x2="9" y2="20" />
          </svg>
        </button>
        {!collapsed && (
          <button
            onClick={onNewSession}
            disabled={disabled}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono-spy text-[10px] uppercase tracking-wider text-spy-muted hover:bg-white/5 hover:text-spy-gold disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New op
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          <div className="border-b border-spy-line px-4 py-4">
            <div className="font-mono-spy text-2xl tracking-[0.15em] text-spy-gold">006</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-spy-muted">
              Field operations
            </div>
          </div>
          <div className="flex flex-col gap-1 px-2 py-2">
            <div className="px-2 py-2 font-mono-spy text-[10px] uppercase tracking-[0.2em] text-spy-muted">
              Mission scenarios
            </div>
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
              const s = SCENARIOS[key];
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => onPick(key)}
                  className={`group flex flex-col items-start gap-0.5 rounded-sm px-3 py-2 text-left text-sm transition disabled:opacity-50 ${
                    isActive
                      ? "border border-spy-gold/30 bg-spy-gold/10"
                      : "border border-transparent hover:border-spy-line hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="font-medium text-spy-text">{s.label}</span>
                  <span className="text-[11px] leading-snug text-spy-muted">{s.description}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-auto border-t border-spy-line px-4 py-3 font-mono-spy text-[10px] uppercase tracking-wider text-spy-muted">
        {!collapsed && "006 · classified demo"}
      </div>
    </aside>
  );
}
