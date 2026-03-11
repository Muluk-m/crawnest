import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AppConfig, DiagnosticsInfo } from "../../lib/types";

const STEP_KEYS = ["setup.stepWelcome", "setup.stepEnvironment", "setup.stepProvider", "setup.stepFeishu"] as const;

function StepIndicator({ current, t }: { current: number; t: (key: string) => string }) {
  const steps = [t('setup.stepWelcome'), t('setup.stepEnvironment'), t('setup.stepProvider'), t('setup.stepFeishu')];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
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
          {i < steps.length - 1 && (
            <div className="w-8 h-px bg-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep({ t }: { t: (key: string) => string }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-3">{t('setup.welcomeTitle')}</h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        {t('setup.welcomeDesc')}
      </p>
      <p className="text-sm text-gray-400">{t('setup.clickNext')}</p>
    </div>
  );
}

// Step 2: Environment Check
function EnvironmentStep({
  diagnostics,
  loading,
  error,
  onRetry,
  t,
}: {
  diagnostics: DiagnosticsInfo | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  t: (key: string) => string;
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500">{t('setup.checkingEnv')}</p>
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
          {t('setup.retry')}
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
      <h2 className="text-lg font-semibold mb-4">{t('setup.runtimeEnv')}</h2>
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
              {item.ok ? t('setup.ok') : t('setup.missing')}
            </span>
          </div>
        ))}
      </div>

      {diagnostics.proxyVarsDetected.length > 0 && (
        <div className="p-3 rounded border border-yellow-200 bg-yellow-50 text-sm">
          <span className="font-medium text-yellow-700">{t('setup.proxyDetected')}</span>
          <span className="text-yellow-600">
            {diagnostics.proxyVarsDetected.join(", ")}
          </span>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>{t('setup.dataDir')}: {diagnostics.userDataDir}</p>
        <p>{t('setup.runtimeDir')}: {diagnostics.runtimeDir}</p>
      </div>
    </div>
  );
}

// Step 3: Provider / Gateway Config
function ProviderStep({
  config,
  onChange,
  t,
}: {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
  t: (key: string) => string;
}) {
  const updateGateway = (field: keyof AppConfig["gateway"], value: string | number) => {
    onChange({ ...config, gateway: { ...config.gateway, [field]: value } });
  };
  const updateProvider = (field: keyof AppConfig["provider"], value: string) => {
    onChange({ ...config, provider: { ...config.provider, [field]: value } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{t('setup.gatewayProvider')}</h2>

      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {t('setup.gateway')}
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-gray-500">{t('setup.host')}</span>
            <input
              type="text"
              value={config.gateway.host}
              onChange={(e) => updateGateway("host", e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">{t('setup.port')}</span>
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
          {t('setup.provider')}
        </legend>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-gray-500">{t('setup.type')}</span>
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
            <span className="text-xs text-gray-500">{t('setup.apiKeyLabel')}</span>
            <input
              type="password"
              value={config.provider.apiKey}
              onChange={(e) => updateProvider("apiKey", e.target.value)}
              placeholder="sk-..."
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">{t('setup.baseUrlLabel')}</span>
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
  t,
}: {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
  t: (key: string) => string;
}) {
  const updateFeishu = (field: keyof AppConfig["feishu"], value: string | boolean) => {
    onChange({ ...config, feishu: { ...config.feishu, [field]: value } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{t('setup.feishuTitle')}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {t('setup.feishuDesc')}
      </p>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={config.feishu.enabled}
          onChange={(e) => updateFeishu("enabled", e.target.checked)}
          className="rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">
          {t('setup.enableFeishuIntegration')}
        </span>
      </label>

      {config.feishu.enabled && (
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-gray-500">{t('setup.appIdLabel')}</span>
            <input
              type="text"
              value={config.feishu.appId}
              onChange={(e) => updateFeishu("appId", e.target.value)}
              placeholder="cli_xxx"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">{t('setup.appSecretLabel')}</span>
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
  const { t } = useTranslation();
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

  const isLastStep = step === STEP_KEYS.length - 1;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <StepIndicator current={step} t={t} />

        <div className="min-h-[280px]">
          {step === 0 && <WelcomeStep t={t} />}
          {step === 1 && (
            <EnvironmentStep
              diagnostics={diagnostics}
              loading={diagLoading}
              error={diagError}
              onRetry={fetchDiagnostics}
              t={t}
            />
          )}
          {step === 2 && <ProviderStep config={config} onChange={setConfig} t={t} />}
          {step === 3 && <FeishuStep config={config} onChange={setConfig} t={t} />}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('setup.back')}
          </button>

          {isLastStep ? (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-5 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? t('setup.saving') : t('setup.finishSetup')}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {t('setup.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
