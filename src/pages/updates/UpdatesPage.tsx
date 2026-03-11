import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

export default function UpdatesPage() {
  const [versions, setVersions] = useState({ app: "0.2.0", node: "", openclaw: "" });
  const { t } = useTranslation();

  useEffect(() => {
    invoke<Record<string, unknown>>("get_diagnostics_info").then((info) => {
      setVersions((prev) => ({ ...prev, node: info.nodeAvailable ? "Available" : "Not found", openclaw: info.openclawAvailable ? "Available" : "Not found" }));
    });
  }, []);

  const handleRepair = async () => {
    if (!confirm(t('updates.reinitializeHint'))) return;
    try { await invoke("init_user_data_dir"); await invoke("copy_plugin_to_extensions"); alert(t('updates.reinitialize')); } catch (e) { alert(`${t('updates.repairRuntime')}: ${e}`); }
  };

  const headCls = "text-xs font-semibold text-text-muted uppercase tracking-wider mb-3";
  const cardCls = "bg-surface-elevated rounded-xl border border-border p-4";

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-semibold text-text mb-6">{t('updates.title')}</h1>

      <h2 className={headCls}>{t('updates.versionInfo')}</h2>
      <div className={`${cardCls} space-y-3 mb-6`}>
        {[["application", versions.app], ["nodeRuntime", versions.node], ["openclaw", versions.openclaw]].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm"><span className="text-text-secondary">{t(`updates.${k}`)}</span><span className="font-mono text-text-muted">{v}</span></div>
        ))}
      </div>

      <h2 className={headCls}>{t('updates.checkForUpdates')}</h2>
      <div className={`${cardCls} mb-6`}>
        <p className="text-xs text-text-muted mb-3">{t('updates.autoUpdateHint')}</p>
        <button disabled className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white opacity-50 cursor-not-allowed">{t('updates.checkButton')}</button>
      </div>

      <h2 className={headCls}>{t('updates.manualUpdate')}</h2>
      <div className={`${cardCls} text-sm text-text-secondary space-y-2 mb-6`}>
        <p>{t('updates.manualUpdateDesc')}</p>
        <ol className="list-decimal list-inside space-y-1 text-text-muted text-xs">
          <li>{t('updates.manualStep1')}</li><li>{t('updates.manualStep2')}</li><li>{t('updates.manualStep3')}</li><li>{t('updates.manualStep4')}</li>
        </ol>
      </div>

      <h2 className={headCls}>{t('updates.repairRuntime')}</h2>
      <div className={cardCls}>
        <button onClick={handleRepair} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-warning/30 text-warning hover:bg-warning-soft transition-colors">{t('updates.reinitialize')}</button>
        <p className="text-[11px] text-text-muted mt-2">{t('updates.reinitializeHint')}</p>
      </div>
    </div>
  );
}
