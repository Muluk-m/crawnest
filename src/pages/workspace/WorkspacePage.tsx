import { useGateway } from "../../hooks/useGateway";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const statusColors: Record<string, string> = {
  running: "text-green-600",
  stopped: "text-gray-500",
  starting: "text-yellow-600",
  failed: "text-red-600",
};

export default function WorkspacePage() {
  const { state } = useGateway();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('workspace.title')}</h1>

      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-medium ${statusColors[state.status]}`}>
            {t('workspace.gatewayStatus')}: {t(`status.${state.status}`)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-8 text-center mb-6">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-500 mb-2">{t('workspace.comingSoon')}</h2>
        <p className="text-sm text-gray-400">{t('workspace.comingSoonDesc')}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('workspace.quickActions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/logs")} className="bg-white border rounded-lg p-3 text-left text-sm hover:bg-gray-50">
            {t('workspace.viewLogs')}
          </button>
          <button onClick={() => navigate("/diagnostics")} className="bg-white border rounded-lg p-3 text-left text-sm hover:bg-gray-50">
            {t('workspace.runDiagnostics')}
          </button>
          <button onClick={() => navigate("/settings")} className="bg-white border rounded-lg p-3 text-left text-sm hover:bg-gray-50">
            {t('workspace.configureSettings')}
          </button>
          <button onClick={() => navigate("/skills")} className="bg-white border rounded-lg p-3 text-left text-sm hover:bg-gray-50">
            {t('workspace.manageSkills')}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('workspace.recentActivity')}</h2>
        <div className="bg-white rounded-lg border p-6 text-center text-sm text-gray-400">
          {t('workspace.noRecentActivity')}
        </div>
      </div>
    </div>
  );
}
