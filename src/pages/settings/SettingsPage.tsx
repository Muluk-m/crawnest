import { useState, useEffect } from "react";
import { useConfig } from "../../hooks/useConfig";
import type { AppConfig } from "../../lib/types";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-surface-elevated rounded-xl border border-border p-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-text-secondary mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const { config, loading, save } = useConfig();
  const [form, setForm] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paths, setPaths] = useState({ userDataDir: "", runtimeDir: "", nodePath: "" });
  const { t, i18n } = useTranslation();

  useEffect(() => { if (config) setForm({ ...config }); }, [config]);
  useEffect(() => {
    invoke<Record<string, unknown>>("get_diagnostics_info").then((info) => {
      setPaths({ userDataDir: (info.userDataDir as string) || "", runtimeDir: (info.runtimeDir as string) || "", nodePath: (info.nodePath as string) || "" });
    });
  }, []);

  if (loading || !form) return <div className="p-6 text-text-muted">{t('common.loading')}</div>;

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      if (form.app.autoStartOnBoot) await invoke("enable_autostart"); else await invoke("disable_autostart");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };
  const update = (section: keyof AppConfig, key: string, value: unknown) => {
    setForm((prev) => prev ? { ...prev, [section]: { ...prev[section], [key]: value } } : prev);
  };

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <h1 className="text-lg font-semibold text-text mb-6">{t('settings.title')}</h1>

      <Section title={t('settings.gatewayConfig')}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('settings.host')}><input type="text" value={form.gateway.host} onChange={(e) => update("gateway", "host", e.target.value)} /></Field>
          <Field label={t('settings.port')}><input type="number" value={form.gateway.port} onChange={(e) => update("gateway", "port", parseInt(e.target.value) || 3000)} /></Field>
        </div>
      </Section>

      <Section title={t('settings.providerConfig')}>
        <Field label={t('settings.providerType')}><input type="text" value={form.provider.type} onChange={(e) => update("provider", "type", e.target.value)} /></Field>
        <Field label={t('settings.apiKey')}><input type="password" value={form.provider.apiKey} onChange={(e) => update("provider", "apiKey", e.target.value)} /></Field>
        <Field label={t('settings.baseUrl')}><input type="text" value={form.provider.baseUrl} onChange={(e) => update("provider", "baseUrl", e.target.value)} /></Field>
      </Section>

      <Section title={t('settings.feishuIntegration')}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.feishu.enabled} onChange={(e) => update("feishu", "enabled", e.target.checked)} />
          <span className="text-sm text-text-secondary">{t('settings.enableFeishu')}</span>
        </label>
        {form.feishu.enabled && (
          <>
            <Field label={t('settings.appId')}><input type="text" value={form.feishu.appId} onChange={(e) => update("feishu", "appId", e.target.value)} /></Field>
            <Field label={t('settings.appSecret')}><input type="password" value={form.feishu.appSecret} onChange={(e) => update("feishu", "appSecret", e.target.value)} /></Field>
          </>
        )}
      </Section>

      <Section title={t('settings.application')}>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.app.autoStartOnBoot} onChange={(e) => update("app", "autoStartOnBoot", e.target.checked)} /><span className="text-sm text-text-secondary">{t('settings.startOnBoot')}</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.app.autoStartGateway} onChange={(e) => update("app", "autoStartGateway", e.target.checked)} /><span className="text-sm text-text-secondary">{t('settings.autoStartGateway')}</span></label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">{t('settings.language')}</span>
          <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className="!w-auto">
            <option value="zh">zh-CN</option>
            <option value="en">English</option>
          </select>
        </div>
      </Section>

      <Section title={t('settings.envPaths')}>
        <div className="space-y-2 text-xs text-text-secondary">
          <div><span className="font-medium text-text-muted">{t('settings.userData')}:</span> <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">{paths.userDataDir}</code></div>
          <div><span className="font-medium text-text-muted">{t('settings.runtimePath')}:</span> <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">{paths.runtimeDir}</code></div>
          <div><span className="font-medium text-text-muted">{t('settings.nodePath')}:</span> <code className="bg-bg px-1.5 py-0.5 rounded text-[11px]">{paths.nodePath}</code></div>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
          {saving ? t('settings.saving') : t('settings.saveChanges')}
        </button>
        {saved && <span className="text-sm text-success">{t('settings.saved')}</span>}
      </div>
    </div>
  );
}
