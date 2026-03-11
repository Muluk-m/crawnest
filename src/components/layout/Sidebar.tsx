import { NavLink } from "react-router-dom";
import { useGateway } from "../../hooks/useGateway";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  labelKey: string;
  icon: ReactNode;
}

function Icon({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    to: "/",
    labelKey: "sidebar.dashboard",
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  },
  {
    to: "/workspace",
    labelKey: "sidebar.workspace",
    icon: <Icon d="M2 3h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3z M8 21h8 M12 17v4" />,
  },
  {
    to: "/skills",
    labelKey: "sidebar.skills",
    icon: <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    to: "/automation",
    labelKey: "sidebar.automation",
    icon: <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />,
  },
  {
    to: "/logs",
    labelKey: "sidebar.logs",
    icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
  },
  {
    to: "/settings",
    labelKey: "sidebar.settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    to: "/diagnostics",
    labelKey: "sidebar.diagnostics",
    icon: <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  {
    to: "/updates",
    labelKey: "sidebar.updates",
    icon: <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />,
  },
];

const statusConfig: Record<string, { color: string; pulse: boolean }> = {
  running: { color: "bg-success", pulse: false },
  starting: { color: "bg-warning", pulse: true },
  stopped: { color: "bg-text-muted", pulse: false },
  failed: { color: "bg-danger", pulse: false },
};

export default function Sidebar() {
  const { state } = useGateway();
  const { t } = useTranslation();
  const sc = statusConfig[state.status] ?? statusConfig.stopped;

  return (
    <aside className="w-52 flex flex-col h-full bg-surface border-r border-border-subtle shrink-0">
      {/* Logo area — includes macOS traffic light spacing */}
      <div
        data-tauri-drag-region="true"
        className="h-12 flex items-end px-4 pb-2 shrink-0"
      >
        <div className="flex items-center gap-2 pl-16">
          <span className="text-base">🦞</span>
          <span className="text-sm font-semibold text-text tracking-tight">OpenClaw</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text"
              }`
            }
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Gateway status */}
      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${sc.color} ${sc.pulse ? "animate-pulse" : ""}`} />
          <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
            {t(`status.${state.status}`)}
          </span>
        </div>
      </div>
    </aside>
  );
}
