import { useTranslation } from "react-i18next";

export default function AutomationPage() {
  const { t } = useTranslation();
  const headCls = "text-xs font-semibold text-text-muted uppercase tracking-wider mb-3";
  const cardCls = "bg-surface-elevated rounded-xl border border-border p-4 text-sm text-text-muted";

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-text">{t('automation.title')}</h1>
        <button disabled className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white opacity-50 cursor-not-allowed">{t('automation.newTask')}</button>
      </div>
      <h2 className={headCls}>{t('automation.tasks')}</h2>
      <div className="bg-surface-elevated rounded-xl border border-border p-10 text-center mb-6">
        <div className="text-4xl text-text-muted mb-3">🔄</div>
        <p className="text-sm text-text-secondary mb-1">{t('automation.noTasks')}</p>
        <p className="text-xs text-text-muted">{t('automation.cronHint')}</p>
      </div>
      <h2 className={headCls}>{t('automation.schedule')}</h2>
      <div className={`${cardCls} mb-6`}>{t('automation.scheduleFuture')}</div>
      <h2 className={headCls}>{t('automation.executionHistory')}</h2>
      <div className={cardCls}>{t('automation.noHistory')}</div>
    </div>
  );
}
