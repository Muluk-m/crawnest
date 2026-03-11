import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DiagnosticsInfo } from "../../lib/types";
import { useGateway } from "../../hooks/useGateway";
import { useTranslation } from "react-i18next";

function CheckItem({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        {detail && <div className="text-[11px] text-text-muted font-mono mt-0.5">{detail}</div>}
      </div>
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? "bg-success" : "bg-danger"}`} />
    </div>
  );
}

export default function DiagnosticsPage() {
  const [info, setInfo] = useState<DiagnosticsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { state } = useGateway();
  const { t } = useTranslation();

  const loadDiagnostics = async () => {
    setLoading(true);
    try { setInfo(await invoke<DiagnosticsInfo>("get_diagnostics_info")); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadDiagnostics(); }, []);

  const handleReset = async () => {
    if (!confirm(t('diagnostics.resetConfigHint'))) return;
    try { await invoke("init_user_data_dir"); loadDiagnostics(); } catch (e) { console.error(e); }
  };

  if (loading || !info) return <div className="p-6 text-text-muted">{t('diagnostics.runningDiagnostics')}</div>;

  const sectionCls = "bg-surface-elevated rounded-xl border border-border p-4 mb-4";
  const headCls = "text-xs font-semibold text-text-muted uppercase tracking-wider mb-3";
  const btnCls = "px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors";

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-text">{t('diagnostics.title')}</h1>
        <button onClick={loadDiagnostics} className={btnCls}>{t('diagnostics.recheck')}</button>
      </div>

      <h2 className={headCls}>{t('diagnostics.runtime')}</h2>
      <div className={sectionCls}>
        <CheckItem label={t('diagnostics.nodeRuntime')} ok={info.nodeAvailable} detail={info.nodePath} />
        <CheckItem label={t('diagnostics.openclawPackage')} ok={info.openclawAvailable} />
        <CheckItem label={t('diagnostics.feishuPlugin')} ok={info.pluginAvailable} />
      </div>

      <h2 className={headCls}>{t('diagnostics.directories')}</h2>
      <div className={sectionCls}>
        {Object.entries(info.configDirs).map(([dir, exists]) => (
          <CheckItem key={dir} label={`${dir}/`} ok={exists} detail={`${info.userDataDir}/${dir}`} />
        ))}
      </div>

      <h2 className={headCls}>{t('diagnostics.proxyEnvironment')}</h2>
      <div className={sectionCls}>
        {info.proxyVarsDetected.length === 0
          ? <CheckItem label={t('diagnostics.proxyEnvironment')} ok={true} detail={t('diagnostics.noProxy')} />
          : info.proxyVarsDetected.map((v) => <CheckItem key={v} label={t('diagnostics.proxyDetected')} ok={false} detail={v} />)
        }
      </div>

      {state.last_error && (
        <>
          <h2 className={headCls}>{t('diagnostics.lastError')}</h2>
          <div className="bg-danger-soft border border-danger/20 rounded-xl p-4 text-sm text-danger mb-4">{state.last_error}</div>
        </>
      )}

      <h2 className={headCls}>{t('diagnostics.repair')}</h2>
      <div className={sectionCls}>
        <button onClick={handleReset} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-danger/30 text-danger hover:bg-danger-soft transition-colors">
          {t('diagnostics.resetConfig')}
        </button>
        <p className="text-[11px] text-text-muted mt-2">{t('diagnostics.resetConfigHint')}</p>
      </div>
    </div>
  );
}
