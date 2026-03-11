import { useEffect, useRef, useState } from "react";
import { useGateway } from "../../hooks/useGateway";
import { useTranslation } from "react-i18next";

export default function LogsPage() {
  const { state, logs, clearLogs } = useGateway();
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const filtered = errorsOnly ? logs.filter((l) => l.stream === "stderr") : logs;

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filtered, autoScroll]);

  const handleCopy = () => {
    const text = filtered.map((l) => l.line).join("\n");
    navigator.clipboard.writeText(text);
  };

  const toggleCls =
    "px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors";
  const onCls = "border-accent/40 bg-accent/10 text-accent";
  const offCls = "border-border text-text-muted hover:bg-surface-hover";
  const btnCls =
    "px-2.5 py-1 text-[11px] font-medium rounded-md border border-border text-text-muted hover:bg-surface-hover transition-colors";

  return (
    <div className="p-6 flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-text">{t("logs.title")}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setErrorsOnly(!errorsOnly)}
            className={`${toggleCls} ${errorsOnly ? onCls : offCls}`}
          >
            {t("logs.errorsOnly")}
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`${toggleCls} ${autoScroll ? onCls : offCls}`}
          >
            {t("logs.autoScroll")}
          </button>
          <button onClick={handleCopy} className={btnCls}>
            {t("logs.copy")}
          </button>
          <button onClick={clearLogs} className={btnCls}>
            {t("logs.clear")}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-surface-elevated rounded-xl border border-border p-4 font-mono text-xs leading-5"
      >
        {state.status === "stopped" ? (
          <div className="text-text-muted">{t("logs.gatewayNotRunning")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-text-muted">{t("logs.waitingForLogs")}</div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={i}
              className={
                entry.stream === "stderr" ? "text-danger" : "text-text-secondary"
              }
            >
              {entry.line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
