import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AppConfig } from "../lib/types";

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke<AppConfig>("read_config");
      setConfig(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (newConfig: AppConfig) => {
    await invoke("write_config", { config: newConfig });
    setConfig(newConfig);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { config, loading, error, save, reload: load };
}
