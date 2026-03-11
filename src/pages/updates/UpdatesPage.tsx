import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function UpdatesPage() {
  const [versions, setVersions] = useState({
    app: "0.1.0",
    node: "",
    openclaw: "",
  });

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
    if (!confirm("Re-initialize runtime from app resources?")) return;
    try {
      await invoke("init_user_data_dir");
      await invoke("copy_plugin_to_extensions");
      alert("Runtime repaired successfully.");
    } catch (e) {
      alert(`Repair failed: ${e}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Updates</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Version Information</h2>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Application</span>
            <span className="font-mono">{versions.app}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Node.js Runtime</span>
            <span className="font-mono">{versions.node}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">OpenClaw</span>
            <span className="font-mono">{versions.openclaw}</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Check for Updates</h2>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500 mb-3">Automatic update checking will be available in a future release.</p>
          <button disabled className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed">
            Check for Updates
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Manual Update</h2>
        <div className="bg-white rounded-lg border p-4 text-sm text-gray-600 space-y-2">
          <p>To manually update the runtime:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-500">
            <li>Download the latest OpenClaw Desktop release</li>
            <li>Stop the gateway if running</li>
            <li>Install the new version (replaces the old one)</li>
            <li>Re-launch and verify in Diagnostics</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Repair Runtime</h2>
        <div className="bg-white rounded-lg border p-4">
          <button onClick={handleRepair} className="px-3 py-1.5 text-sm border border-orange-300 text-orange-600 rounded-md hover:bg-orange-50">
            Re-initialize Runtime
          </button>
          <p className="text-xs text-gray-400 mt-2">Copies bundled runtime resources to user directory. Use if runtime is corrupted.</p>
        </div>
      </section>
    </div>
  );
}
