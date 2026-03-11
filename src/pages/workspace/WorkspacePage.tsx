import { useGateway } from "../../hooks/useGateway";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function WorkspacePage() {
  const { state } = useGateway();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions = [
    { label: t('workspace.viewLogs'), path: "/logs" },
    { label: t('workspace.runDiagnostics'), path: "/diagnostics" },
    { label: t('workspace.configureSettings'), path: "/settings" },
    { label: t('workspace.manageSkills'), path: "/skills" },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-lg font-semibold text-text mb-6">{t('workspace.title')}</h1>
      <div className="mb-6 bg-surface-elevated rounded-xl border border-border p-4">
        <span className="text-sm text-text-secondary">{t('workspace.gatewayStatus')}: </span>
        <span className={`text-sm font-medium ${state.status === "running" ? "text-success" : state.status === "failed" ? "text-danger" : "text-text-muted"}`}>
          {t(`status.${state.status}`)}
        </span>
      </div>
      <div className="bg-surface-elevated rounded-xl border border-border p-10 text-center mb-6">
        <div className="text-text-muted text-4xl mb-3">💬</div>
        <h2 className="text-sm font-medium text-text-secondary mb-1">{t('workspace.comingSoon')}</h2>
        <p className="text-xs text-text-muted">{t('workspace.comingSoonDesc')}</p>
      </div>
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{t('workspace.quickActions')}</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.path} onClick={() => navigate(a.path)} className="bg-surface-elevated border border-border rounded-xl p-3 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors">
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
