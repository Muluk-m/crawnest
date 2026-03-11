import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

interface Skill {
  name: string;
  version: string;
  status: "ok" | "error";
  error?: string;
}

export default function SkillsPage() {
  const [skills] = useState<Skill[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: implement skill scanning via backend
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOpenDir = async () => {
    try {
      const info = await invoke<Record<string, string>>("get_diagnostics_info");
      const dir = info.userDataDir + "/extensions";
      await invoke("plugin:opener|open_url", { url: dir });
    } catch (e) {
      console.error("Failed to open directory:", e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('skills.title')}</h1>
        <div className="flex gap-2">
          <button onClick={handleOpenDir} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            {t('skills.openDirectory')}
          </button>
          <button onClick={handleRefresh} disabled={refreshing} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {refreshing ? t('skills.refreshing') : t('skills.refresh')}
          </button>
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">{t('skills.noSkills')}</p>
          <p className="text-xs text-gray-400">{t('skills.noSkillsHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map((skill) => (
            <div key={skill.name} className={`bg-white rounded-lg border p-4 flex items-center justify-between ${skill.status === "error" ? "border-red-200" : ""}`}>
              <div>
                <div className="font-medium text-sm">{skill.name}</div>
                <div className="text-xs text-gray-400">v{skill.version}</div>
              </div>
              <div className="flex items-center gap-2">
                {skill.status === "error" ? (
                  <span className="text-xs text-red-500" title={skill.error}>{t('skills.error')}</span>
                ) : (
                  <span className="text-xs text-green-500">{t('skills.active')}</span>
                )}
                <span className={`w-2 h-2 rounded-full ${skill.status === "error" ? "bg-red-500" : "bg-green-500"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
