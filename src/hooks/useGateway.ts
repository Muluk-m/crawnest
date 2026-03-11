import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { GatewayState, GatewayStatus, LogEntry } from "../lib/types";

export function useGateway() {
  const [state, setState] = useState<GatewayState>({
    status: "stopped",
    pid: null,
    last_error: null,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const maxLogs = useRef(1000);

  useEffect(() => {
    invoke<GatewayState>("get_gateway_status").then(setState).catch(console.error);

    const unlistenStatus = listen<GatewayStatus>("gateway-status", (event) => {
      setState((prev) => ({ ...prev, status: event.payload }));
    });

    const unlistenLog = listen<LogEntry>("gateway-log", (event) => {
      setLogs((prev) => {
        const next = [...prev, { ...event.payload, timestamp: Date.now() }];
        return next.length > maxLogs.current ? next.slice(-maxLogs.current) : next;
      });
    });

    return () => {
      unlistenStatus.then((f) => f());
      unlistenLog.then((f) => f());
    };
  }, []);

  const start = useCallback(async () => {
    await invoke("start_gateway");
  }, []);

  const stop = useCallback(async () => {
    await invoke("stop_gateway");
  }, []);

  const restart = useCallback(async () => {
    await invoke("restart_gateway");
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { state, logs, start, stop, restart, clearLogs };
}
