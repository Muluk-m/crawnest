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
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-2">
          {state.status === "failed" ? "\u26A0\uFE0F" : "\u{1F980}"}
        </div>
        <h2 className="text-xl font-semibold text-gray-200">
          {t('dashboard.gatewayService')}
        </h2>
        <p className="text-sm text-gray-400">
          {isStarting ? t('status.starting') : t(`status.${state.status}`)}
        </p>

        {state.last_error && (
          <div className="max-w-md mx-auto rounded bg-red-950/60 border border-red-800/50 p-3">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">
              {t('dashboard.lastError')}
            </p>
            <p className="text-sm text-red-300 font-mono whitespace-pre-wrap break-all">
              {state.last_error}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          {isRunning ? (
            <button
              onClick={openDashboardWindow}
              className="px-6 py-2 text-sm font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              {t('dashboard.openDashboard')}
            </button>
          ) : state.status === "failed" ? (
            <button
              onClick={restart}
              className="px-6 py-2 text-sm font-medium rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              {t('dashboard.restart')}
            </button>
          ) : (
            <button
              onClick={start}
              disabled={isStarting}
              className="px-6 py-2 text-sm font-medium rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStarting ? t('status.starting') : t('dashboard.start')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
