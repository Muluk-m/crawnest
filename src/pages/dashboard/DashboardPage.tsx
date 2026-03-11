import { useGateway } from "../../hooks/useGateway";
import { useTranslation } from "react-i18next";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const DASHBOARD_URL = "http://127.0.0.1:18789/";

async function openDashboardWindow() {
  const existing = await WebviewWindow.getByLabel("openclaw-dashboard");
  if (existing) {
    await existing.setFocus();
    return;
  }
  new WebviewWindow("openclaw-dashboard", {
    url: DASHBOARD_URL,
    title: "OpenClaw Dashboard",
    width: 1200,
    height: 800,
    center: true,
  });
}

export default function DashboardPage() {
  const { state, start, restart } = useGateway();
  const { t } = useTranslation();
  const isRunning = state.status === "running";
  const isStarting = state.status === "starting";

  return (
    <div className="flex items-center justify-center h-full animate-fade-in">
      <div className="text-center space-y-5">
        <div className="text-7xl mb-1">{state.status === "failed" ? "\u26A0\uFE0F" : "\u{1F980}"}</div>
        <h2 className="text-xl font-semibold text-text">{t('dashboard.gatewayService')}</h2>
        <p className="text-sm text-text-muted">
          {isStarting ? t('status.starting') : t(`status.${state.status}`)}
        </p>

        {state.last_error && (
          <div className="max-w-md mx-auto rounded-xl bg-danger-soft border border-danger/20 p-4">
            <p className="text-[11px] font-semibold text-danger uppercase tracking-wider mb-1">{t('dashboard.lastError')}</p>
            <p className="text-xs text-danger/80 font-mono break-all">{state.last_error}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-1">
          {isRunning ? (
            <button onClick={openDashboardWindow} className="px-6 py-2.5 text-sm font-medium rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors">
              {t('dashboard.openDashboard')}
            </button>
          ) : state.status === "failed" ? (
            <button onClick={restart} className="px-6 py-2.5 text-sm font-medium rounded-xl bg-warning hover:brightness-110 text-white transition-all">
              {t('dashboard.restart')}
            </button>
          ) : (
            <button onClick={start} disabled={isStarting} className="px-6 py-2.5 text-sm font-medium rounded-xl bg-success hover:brightness-110 text-white disabled:opacity-50 transition-all">
              {isStarting ? t('status.starting') : t('dashboard.start')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
