import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import type { AppConfig, DiagnosticsInfo } from "../../lib/types";

const STEPS = ["Welcome", "Environment", "Provider", "Feishu"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i < current
                ? "bg-green-600 text-white"
                : i === current
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {i < current ? "\u2713" : i + 1}
          </div>
          <span
            className={`text-sm hidden sm:inline ${
              i === current ? "text-gray-900 font-medium" : "text-gray-400"
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className="w-8 h-px bg-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-3">Welcome to OpenClaw Desktop</h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        This wizard will guide you through the initial setup. We will check your
        runtime environment, configure the gateway provider, and optionally set
        up Feishu integration.
      </p>
      <p className="text-sm text-gray-400">Click Next to get started.</p>
    </div>
  );
}

// Step 2: Environment Check
function EnvironmentStep({
  diagnostics,
  loading,
  error,
  onRetry,
}: {
  diagnostics: DiagnosticsInfo | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">Checking runtime environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!diagnostics) return null;

  const items: { label: string; ok: boolean; detail?: string }[] = [
    {
      label: "Node.js",
      ok: diagnostics.nodeAvailable,
      detail: diagnostics.nodePath || "not found",
    },
    {
      label: "OpenClaw CLI",
      ok: diagnostics.openclawAvailable,
    },
    {
      label: "Plugin",
      ok: diagnostics.pluginAvailable,
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Runtime Environment</h2>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 rounded border border-gray-200 bg-gray-50"
          >
            <div>
              <span className="font-medium text-sm">{item.label}</span>
              {item.detail && (
                <span className="text-xs text-gray-400 ml-2">
                  {item.detail}
                </span>
              )}
            </div>
            <span
              className={`text-sm font-medium ${item.ok ? "text-green-600" : "text-red-500"}`}
            >
              {item.ok ? "OK" : "Missing"}
            </span>
          </div>
        ))}
      </div>

      {diagnostics.proxyVarsDetected.length > 0 && (
        <div className="p-3 rounded border border-yellow-200 bg-yellow-50 text-sm">
          <span className="font-medium text-yellow-700">Proxy detected: </span>
          <span className="text-yellow-600">
            {diagnostics.proxyVarsDetected.join(", ")}
          </span>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>Data dir: {diagnostics.userDataDir}</p>
        <p>Runtime dir: {diagnostics.runtimeDir}</p>
      </div>
    </div>
  );
}

// Step 3: Provider / Gateway Config
function ProviderStep({
  config,
  onChange,
}: {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}) {
  const updateGateway = (field: keyof AppConfig["gateway"], value: string | number) => {
    onChange({ ...config, gateway: { ...config.gateway, [field]: value } });
  };
  const updateProvider = (field: keyof AppConfig["provider"], value: string) => {
    onChange({ ...config, provider: { ...config.provider, [field]: value } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Gateway & Provider</h2>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-gray-700 mb-2">
          Gateway
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-gray-500">Host</span>
            <input
              type="text"
              value={config.gateway.host}
              onChange={(e) => updateGateway("host", e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Port</span>
            <input
              type="number"
              value={config.gateway.port}
              onChange={(e) =>
                updateGateway("port", parseInt(e.target.value, 10) || 0)
              }
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">
          Provider
        </legend>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-gray-500">Type</span>
            <select
              value={config.provider.type}
              onChange={(e) => updateProvider("type", e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="azure">Azure OpenAI</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">API Key</span>
            <input
              type="password"
              value={config.provider.apiKey}
              onChange={(e) => updateProvider("apiKey", e.target.value)}
              placeholder="sk-..."
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Base URL</span>
            <input
              type="text"
              value={config.provider.baseUrl}
              onChange={(e) => updateProvider("baseUrl", e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
}

// Step 4: Feishu Integration
function FeishuStep({
  config,
  onChange,
}: {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}) {
  const updateFeishu = (field: keyof AppConfig["feishu"], value: string | boolean) => {
    onChange({ ...config, feishu: { ...config.feishu, [field]: value } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Feishu Integration</h2>
      <p className="text-sm text-gray-500 mb-4">
        Optional. Connect a Feishu (Lark) app for notifications and automation.
        You can skip this and configure it later in Settings.
      </p>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={config.feishu.enabled}
          onChange={(e) => updateFeishu("enabled", e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">
          Enable Feishu integration
        </span>
      </label>

      {config.feishu.enabled && (
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-gray-500">App ID</span>
            <input
              type="text"
              value={config.feishu.appId}
              onChange={(e) => updateFeishu("appId", e.target.value)}
              placeholder="cli_xxx"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">App Secret</span>
            <input
              type="password"
              value={config.feishu.appSecret}
              onChange={(e) => updateFeishu("appSecret", e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
        </div>
      )}
    </div>
  );
}

const DEFAULT_CONFIG: AppConfig = {
  app: {
    autoStartGateway: true,
    autoStartOnBoot: false,
    setupCompleted: false,
  },
  gateway: {
    port: 3000,
    host: "127.0.0.1",
  },
  provider: {
    type: "openai",
    apiKey: "",
    baseUrl: "",
  },
  feishu: {
    enabled: false,
    appId: "",
    appSecret: "",
  },
};

export default function SetupWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsInfo | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDiagnostics = useCallback(async () => {
    setDiagLoading(true);
    setDiagError(null);
    try {
      const info = await invoke<DiagnosticsInfo>("get_diagnostics_info");
      setDiagnostics(info);
    } catch (err) {
      setDiagError(String(err));
    } finally {
      setDiagLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && !diagnostics && !diagLoading) {
      fetchDiagnostics();
    }
  }, [step, diagnostics, diagLoading, fetchDiagnostics]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const finalConfig: AppConfig = {
        ...config,
        app: { ...config.app, setupCompleted: true },
      };
      await invoke("write_config", { config: finalConfig });
      navigate("/");
    } catch (err) {
      alert("Failed to save configuration: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <StepIndicator current={step} />

        <div className="min-h-[280px]">
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <EnvironmentStep
              diagnostics={diagnostics}
              loading={diagLoading}
              error={diagError}
              onRetry={fetchDiagnostics}
            />
          )}
          {step === 2 && <ProviderStep config={config} onChange={setConfig} />}
          {step === 3 && <FeishuStep config={config} onChange={setConfig} />}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-5 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Finish Setup"}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
