import { useNavigate } from "react-router-dom";
import { useGateway } from "../../hooks/useGateway";
import { useTranslation } from "react-i18next";
import type { GatewayStatus } from "../../lib/types";

const statusConfig: Record<
  GatewayStatus,
  { labelKey: string; color: string; dot: string; bg: string }
> = {
  stopped: {
    labelKey: "status.stopped",
    color: "text-gray-400",
    dot: "bg-gray-400",
    bg: "bg-gray-900/50",
  },
  starting: {
    labelKey: "status.starting",
    color: "text-yellow-400",
    dot: "bg-yellow-400 animate-pulse",
    bg: "bg-yellow-900/20",
  },
  running: {
    labelKey: "status.running",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    bg: "bg-emerald-900/20",
  },
  failed: {
    labelKey: "status.failed",
    color: "text-red-400",
    dot: "bg-red-400",
    bg: "bg-red-900/20",
  },
};

export default function DashboardPage() {
  const { state, start, stop, restart } = useGateway();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cfg = statusConfig[state.status];

  const isActionDisabled = state.status === "starting";

  const quickLinks = [
    {
      titleKey: "dashboard.logs",
      descKey: "dashboard.logsDesc",
      path: "/logs",
      icon: "\u{1F4CB}",
    },
    {
      titleKey: "dashboard.settings",
      descKey: "dashboard.settingsDesc",
      path: "/settings",
      icon: "\u2699\uFE0F",
    },
    {
      titleKey: "dashboard.skills",
      descKey: "dashboard.skillsDesc",
      path: "/skills",
      icon: "\u{1F9E9}",
    },
    {
      titleKey: "dashboard.automation",
      descKey: "dashboard.automationDesc",
      path: "/automation",
      icon: "\u{1F916}",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-100">{t('dashboard.title')}</h1>

      {/* Service Status Card */}
      <div
        className={`rounded-lg border border-gray-700 ${cfg.bg} p-5 space-y-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-block w-3 h-3 rounded-full ${cfg.dot}`} />
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                {t('dashboard.gatewayService')}
              </h2>
              <p className={`text-sm font-medium ${cfg.color}`}>{t(cfg.labelKey)}</p>
            </div>
            {state.pid !== null && (
              <span className="ml-2 text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                PID {state.pid}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {state.status === "stopped" || state.status === "failed" ? (
              <button
                onClick={start}
                disabled={isActionDisabled}
                className="px-4 py-1.5 text-sm font-medium rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('dashboard.start')}
              </button>
            ) : (
              <button
                onClick={stop}
                disabled={isActionDisabled}
                className="px-4 py-1.5 text-sm font-medium rounded bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('dashboard.stop')}
              </button>
            )}
            <button
              onClick={restart}
              disabled={isActionDisabled || state.status === "stopped"}
              className="px-4 py-1.5 text-sm font-medium rounded bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('dashboard.restart')}
            </button>
          </div>
        </div>

        {/* Recent Error */}
        {state.last_error && (
          <div className="rounded bg-red-950/60 border border-red-800/50 p-3">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">
              {t('dashboard.lastError')}
            </p>
            <p className="text-sm text-red-300 font-mono whitespace-pre-wrap break-all">
              {state.last_error}
            </p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          {t('dashboard.quickLinks')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-700/60 hover:border-gray-600 transition-colors text-left"
            >
              <span className="text-xl mt-0.5">{link.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-100">
                  {t(link.titleKey)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t(link.descKey)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          {t('dashboard.recentActivity')}
        </h2>
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <p className="text-sm text-gray-500 italic">
            {t('dashboard.noRecentActivity')}
          </p>
        </div>
      </div>
    </div>
  );
}
