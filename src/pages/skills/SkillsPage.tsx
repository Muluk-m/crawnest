import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

interface Skill { name: string; version: string; status: "ok" | "error"; error?: string; }

export default function SkillsPage() {
  const [skills] = useState<Skill[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const handleRefresh = async () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); };
  const handleOpenDir = async () => {
    try { const info = await invoke<Record<string, string>>("get_diagnostics_info"); await invoke("plugin:opener|open_url", { url: info.userDataDir + "/extensions" }); } catch (e) { console.error(e); }
  };
  const btnCls = "px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors";

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-text">{t('skills.title')}</h1>
        <div className="flex gap-2">
          <button onClick={handleOpenDir} className={btnCls}>{t('skills.openDirectory')}</button>
          <button onClick={handleRefresh} disabled={refreshing} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent hover:bg-accent-hover text-white disabled:opacity-50 transition-colors">
            {refreshing ? t('skills.refreshing') : t('skills.refresh')}
          </button>
        </div>
      </div>
      {skills.length === 0 ? (
        <div className="bg-surface-elevated rounded-xl border border-border p-10 text-center">
          <div className="text-4xl text-text-muted mb-3">⚡</div>
          <p className="text-sm text-text-secondary mb-1">{t('skills.noSkills')}</p>
          <p className="text-xs text-text-muted">{t('skills.noSkillsHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map((skill) => (
            <div key={skill.name} className={`bg-surface-elevated rounded-xl border p-4 flex items-center justify-between ${skill.status === "error" ? "border-danger/30" : "border-border"}`}>
              <div><div className="font-medium text-sm text-text">{skill.name}</div><div className="text-[11px] text-text-muted">v{skill.version}</div></div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] ${skill.status === "error" ? "text-danger" : "text-success"}`}>{skill.status === "error" ? t('skills.error') : t('skills.active')}</span>
                <span className={`w-2 h-2 rounded-full ${skill.status === "error" ? "bg-danger" : "bg-success"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
