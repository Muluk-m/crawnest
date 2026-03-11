import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DiagnosticsInfo } from "../../lib/types";
import { useGateway } from "../../hooks/useGateway";

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
    if (!confirm("Reset configuration to defaults? This will not delete logs or extensions.")) return;
    try {
      await invoke("init_user_data_dir");
      loadDiagnostics();
    } catch (e) {
      console.error("Reset failed:", e);
    }
  };

  if (loading || !info) return <div className="p-6 text-gray-500">Running diagnostics...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Diagnostics</h1>
        <button onClick={loadDiagnostics} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
          Re-check
        </button>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Runtime</h2>
        <div className="bg-white rounded-lg border p-4">
          <CheckItem label="Node.js Runtime" ok={info.nodeAvailable} detail={info.nodePath} />
          <CheckItem label="OpenClaw Package" ok={info.openclawAvailable} />
          <CheckItem label="Feishu Plugin" ok={info.pluginAvailable} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Directories</h2>
        <div className="bg-white rounded-lg border p-4">
          {Object.entries(info.configDirs).map(([dir, exists]) => (
            <CheckItem key={dir} label={`${dir}/`} ok={exists} detail={`${info.userDataDir}/${dir}`} />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Proxy Environment</h2>
        <div className="bg-white rounded-lg border p-4">
          {info.proxyVarsDetected.length === 0 ? (
            <CheckItem label="Proxy Variables" ok={true} detail="No proxy variables detected - clean environment" />
          ) : (
            info.proxyVarsDetected.map((v) => (
              <CheckItem key={v} label="Proxy Detected" ok={false} detail={v} />
            ))
          )}
        </div>
      </section>

      {state.last_error && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Last Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {state.last_error}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Repair</h2>
        <div className="bg-white rounded-lg border p-4">
          <button onClick={handleReset} className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50">
            Reset Configuration
          </button>
          <p className="text-xs text-gray-400 mt-2">Resets app-config.json to default values. Logs and extensions are preserved.</p>
        </div>
      </section>
    </div>
  );
}
