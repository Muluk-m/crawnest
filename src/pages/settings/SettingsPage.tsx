import { useState, useEffect } from "react";
import { useConfig } from "../../hooks/useConfig";
import type { AppConfig } from "../../lib/types";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { config, loading, save } = useConfig();
  const [form, setForm] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paths, setPaths] = useState({ userDataDir: "", runtimeDir: "", nodePath: "" });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (config) setForm({ ...config });
  }, [config]);

  useEffect(() => {
    invoke<Record<string, unknown>>("get_diagnostics_info").then((info) => {
      setPaths({
        userDataDir: (info.userDataDir as string) || "",
        runtimeDir: (info.runtimeDir as string) || "",
        nodePath: (info.nodePath as string) || "",
      });
    });
  }, []);

  if (loading || !form) return <div className="p-6 text-gray-500">{t('common.loading')}</div>;

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);

      // Sync autostart with system
      if (form.app.autoStartOnBoot) {
        await invoke("enable_autostart");
      } else {
        await invoke("disable_autostart");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const update = (section: keyof AppConfig, key: string, value: unknown) => {
    setForm((prev) => prev ? { ...prev, [section]: { ...prev[section], [key]: value } } : prev);
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('settings.gatewayConfig')}</h2>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-600">{t('settings.host')}</span>
            <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" value={form.gateway.host} onChange={(e) => update("gateway", "host", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">{t('settings.port')}</span>
            <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" type="number" value={form.gateway.port} onChange={(e) => update("gateway", "port", parseInt(e.target.value) || 3000)} />
          </label>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('settings.providerConfig')}</h2>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-600">{t('settings.providerType')}</span>
            <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" value={form.provider.type} onChange={(e) => update("provider", "type", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">{t('settings.apiKey')}</span>
            <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" type="password" value={form.provider.apiKey} onChange={(e) => update("provider", "apiKey", e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">{t('settings.baseUrl')}</span>
            <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" value={form.provider.baseUrl} onChange={(e) => update("provider", "baseUrl", e.target.value)} />
          </label>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('settings.feishuIntegration')}</h2>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.feishu.enabled} onChange={(e) => update("feishu", "enabled", e.target.checked)} />
            <span className="text-sm text-gray-600">{t('settings.enableFeishu')}</span>
          </label>
          {form.feishu.enabled && (
            <>
              <label className="block">
                <span className="text-sm text-gray-600">{t('settings.appId')}</span>
                <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" value={form.feishu.appId} onChange={(e) => update("feishu", "appId", e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">{t('settings.appSecret')}</span>
                <input className="mt-1 block w-full px-3 py-2 border rounded-md text-sm" type="password" value={form.feishu.appSecret} onChange={(e) => update("feishu", "appSecret", e.target.value)} />
              </label>
            </>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('settings.application')}</h2>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.app.autoStartOnBoot} onChange={(e) => update("app", "autoStartOnBoot", e.target.checked)} />
            <span className="text-sm text-gray-600">{t('settings.startOnBoot')}</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.app.autoStartGateway} onChange={(e) => update("app", "autoStartGateway", e.target.checked)} />
            <span className="text-sm text-gray-600">{t('settings.autoStartGateway')}</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('settings.language')}</span>
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm bg-white"
            >
              <option value="zh">zh-CN</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">{t('settings.envPaths')}</h2>
        <div className="bg-white rounded-lg border p-4 space-y-2 text-sm text-gray-600">
          <div><span className="font-medium">{t('settings.userData')}:</span> <code className="text-xs bg-gray-100 px-1 rounded">{paths.userDataDir}</code></div>
          <div><span className="font-medium">{t('settings.runtimePath')}:</span> <code className="text-xs bg-gray-100 px-1 rounded">{paths.runtimeDir}</code></div>
          <div><span className="font-medium">{t('settings.nodePath')}:</span> <code className="text-xs bg-gray-100 px-1 rounded">{paths.nodePath}</code></div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? t('settings.saving') : t('settings.saveChanges')}
        </button>
        {saved && <span className="text-sm text-green-600">{t('settings.saved')}</span>}
      </div>
    </div>
  );
}
