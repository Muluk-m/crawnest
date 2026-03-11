import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/workspace": "Workspace",
  "/skills": "Skills",
  "/automation": "Automation",
  "/settings": "Settings",
  "/logs": "Logs",
  "/diagnostics": "Diagnostics",
  "/updates": "Updates",
};

export default function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "OpenClaw";

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 shrink-0 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
