import { createBrowserRouter, redirect } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import AppLayout from "../components/layout/AppLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import SettingsPage from "../pages/settings/SettingsPage";
import WorkspacePage from "../pages/workspace/WorkspacePage";
import SkillsPage from "../pages/skills/SkillsPage";
import AutomationPage from "../pages/automation/AutomationPage";
import LogsPage from "../pages/logs/LogsPage";
import DiagnosticsPage from "../pages/diagnostics/DiagnosticsPage";
import UpdatesPage from "../pages/updates/UpdatesPage";
import SetupWizardPage from "../pages/setup-wizard/SetupWizardPage";

async function requireSetupComplete() {
  try {
    const isComplete = await invoke<boolean>("check_setup_complete");
    if (!isComplete) {
      return redirect("/setup");
    }
  } catch {
    return redirect("/setup");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/setup",
    element: <SetupWizardPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    loader: requireSetupComplete,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "workspace", element: <WorkspacePage /> },
      { path: "skills", element: <SkillsPage /> },
      { path: "automation", element: <AutomationPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "diagnostics", element: <DiagnosticsPage /> },
      { path: "updates", element: <UpdatesPage /> },
    ],
  },
]);
