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
      className={`flex flex-col border-r border-spy-line bg-spy-bg transition-[width] duration-300 ease-out ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-spy-line px-3 py-3">
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="grid h-7 w-7 place-items-center rounded-sm text-spy-muted transition-colors duration-150 hover:bg-white/5 hover:text-spy-text"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="9" y1="4" x2="9" y2="20" />
          </svg>
        </button>
        {!collapsed && (
          <button
            onClick={onNewSession}
            disabled={disabled}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono-spy text-[9.5px] uppercase tracking-wider text-spy-muted transition-colors duration-150 hover:bg-white/5 hover:text-spy-gold disabled:pointer-events-none disabled:opacity-35"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-0.5 overflow-y-auto px-2 py-2 spy-scroll">
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
              const s = SCENARIOS[key];
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => onPick(key)}
                  className={`group flex flex-col items-start gap-0.5 rounded-sm px-3 py-2.5 text-left text-sm transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${
                    isActive
                      ? "border border-spy-gold/30 bg-spy-gold/10"
                      : "border border-transparent hover:border-spy-line/80 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      className={`font-medium transition-colors duration-150 ${
                        isActive ? "text-spy-gold" : "text-spy-text group-hover:text-spy-text"
                      }`}
                    >
                      {s.label}
                    </span>
                    {isActive && (
                      <span className="shrink-0 font-mono-spy text-[8px] uppercase tracking-wider text-spy-gold/70">
                        ● active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] leading-snug text-spy-muted/90">{s.description}</span>
                </button>
              );
            })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-spy-line px-4 py-3">
        {!collapsed ? (
          <div className="font-mono-spy text-[9px] uppercase tracking-wider text-spy-muted/60">
            006 · drift monitor
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="font-mono-spy text-[8px] text-spy-gold/40">006</span>
          </div>
        )}
      </div>
    </aside>
  );
}
