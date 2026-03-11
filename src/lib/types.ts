export type GatewayStatus = "stopped" | "starting" | "running" | "failed";

export interface GatewayState {
  status: GatewayStatus;
  pid: number | null;
  last_error: string | null;
}

export interface LogEntry {
  stream: "stdout" | "stderr";
  line: string;
  timestamp?: number;
}

export interface AppConfig {
  app: {
    autoStartGateway: boolean;
    autoStartOnBoot: boolean;
    setupCompleted: boolean;
  };
  gateway: {
    port: number;
    host: string;
  };
  provider: {
    type: string;
    apiKey: string;
    baseUrl: string;
  };
  feishu: {
    enabled: boolean;
    appId: string;
    appSecret: string;
  };
}

export interface DiagnosticsInfo {
  nodeAvailable: boolean;
  nodePath: string;
  openclawAvailable: boolean;
  pluginAvailable: boolean;
  userDataDir: string;
  runtimeDir: string;
  proxyVarsDetected: string[];
  configDirs: Record<string, boolean>;
}
