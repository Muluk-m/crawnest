import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

export default function UpdatesPage() {
  const [versions, setVersions] = useState({
    app: "0.1.0",
    node: "",
    openclaw: "",
  });
  const { t } = useTranslation();

  useEffect(() => {
    invoke<Record<string, unknown>>("get_diagnostics_info").then((info) => {
      setVersions((prev) => ({
        ...prev,
        node: info.nodeAvailable ? "Available" : "Not found",
        openclaw: info.openclawAvailable ? "Available" : "Not found",
      }));
    });
  }, []);

  const handleRepair = async () => {
    if (!confirm(t('updates.reinitializeHint'))) return;
    try {
      await invoke("init_user_data_dir");
      await invoke("copy_plugin_to_extensions");
      alert(t('updates.reinitialize'));
    } catch (e) {
      alert(`${t('updates.repairRuntime')}: ${e}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('updates.title')}</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('updates.versionInfo')}</h2>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('updates.application')}</span>
            <span className="font-mono">{versions.app}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('updates.nodeRuntime')}</span>
            <span className="font-mono">{versions.node}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('updates.openclaw')}</span>
            <span className="font-mono">{versions.openclaw}</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('updates.checkForUpdates')}</h2>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-3">{t('updates.autoUpdateHint')}</p>
          <button disabled className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed">
            {t('updates.checkButton')}
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('updates.manualUpdate')}</h2>
        <div className="bg-white rounded-lg border p-4 text-sm text-gray-600 space-y-2">
          <p>{t('updates.manualUpdateDesc')}</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-500">
            <li>{t('updates.manualStep1')}</li>
            <li>{t('updates.manualStep2')}</li>
            <li>{t('updates.manualStep3')}</li>
            <li>{t('updates.manualStep4')}</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('updates.repairRuntime')}</h2>
        <div className="bg-white rounded-lg border p-4">
          <button onClick={handleRepair} className="px-3 py-1.5 text-sm border border-orange-300 text-orange-600 rounded-md hover:bg-orange-50">
            {t('updates.reinitialize')}
          </button>
          <p className="text-xs text-gray-400 mt-2">{t('updates.reinitializeHint')}</p>
        </div>
      </section>
    </div>
  );
}
