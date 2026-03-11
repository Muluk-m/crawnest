import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DiagnosticsInfo } from "../../lib/types";
import { useGateway } from "../../hooks/useGateway";
import { useTranslation } from "react-i18next";

function CheckItem({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {detail && <div className="text-xs text-gray-400">{detail}</div>}
      </div>
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />
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
    try {
      const data = await invoke<DiagnosticsInfo>("get_diagnostics_info");
      setInfo(data);
    } catch (e) {
      console.error("Failed to load diagnostics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleReset = async () => {
    if (!confirm(t('diagnostics.resetConfigHint'))) return;
    try {
      await invoke("init_user_data_dir");
      loadDiagnostics();
    } catch (e) {
      console.error("Reset failed:", e);
    }
  };

  if (loading || !info) return <div className="p-6 text-gray-500">{t('diagnostics.runningDiagnostics')}</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('diagnostics.title')}</h1>
        <button onClick={loadDiagnostics} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
          {t('diagnostics.recheck')}
        </button>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('diagnostics.runtime')}</h2>
        <div className="bg-white rounded-lg border p-4">
          <CheckItem label={t('diagnostics.nodeRuntime')} ok={info.nodeAvailable} detail={info.nodePath} />
          <CheckItem label={t('diagnostics.openclawPackage')} ok={info.openclawAvailable} />
          <CheckItem label={t('diagnostics.feishuPlugin')} ok={info.pluginAvailable} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('diagnostics.directories')}</h2>
        <div className="bg-white rounded-lg border p-4">
          {Object.entries(info.configDirs).map(([dir, exists]) => (
            <CheckItem key={dir} label={`${dir}/`} ok={exists} detail={`${info.userDataDir}/${dir}`} />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('diagnostics.proxyEnvironment')}</h2>
        <div className="bg-white rounded-lg border p-4">
          {info.proxyVarsDetected.length === 0 ? (
            <CheckItem label={t('diagnostics.proxyEnvironment')} ok={true} detail={t('diagnostics.noProxy')} />
          ) : (
            info.proxyVarsDetected.map((v) => (
              <CheckItem key={v} label={t('diagnostics.proxyDetected')} ok={false} detail={v} />
            ))
          )}
        </div>
      </section>

      {state.last_error && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('diagnostics.lastError')}</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {state.last_error}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('diagnostics.repair')}</h2>
        <div className="bg-white rounded-lg border p-4">
          <button onClick={handleReset} className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50">
            {t('diagnostics.resetConfig')}
          </button>
          <p className="text-xs text-gray-400 mt-2">{t('diagnostics.resetConfigHint')}</p>
        </div>
      </section>
    </div>
  );
}
