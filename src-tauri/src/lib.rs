use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State,
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum GatewayStatus {
    Stopped,
    Starting,
    Running,
    Failed,
}

#[derive(Debug, Clone, Serialize)]
pub struct GatewayState {
    pub status: GatewayStatus,
    pub pid: Option<u32>,
    pub last_error: Option<String>,
}

struct GatewayProcess {
    state: Mutex<GatewayState>,
    child: Mutex<Option<Child>>,
}

impl Default for GatewayProcess {
    fn default() -> Self {
        Self {
            state: Mutex::new(GatewayState {
                status: GatewayStatus::Stopped,
                pid: None,
                last_error: None,
            }),
            child: Mutex::new(None),
        }
    }
}

fn get_node_binary_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    #[cfg(target_os = "macos")]
    let node_name = if cfg!(target_arch = "aarch64") {
        "node-aarch64-apple-darwin"
    } else {
        "node-x86_64-apple-darwin"
    };

    #[cfg(target_os = "windows")]
    let node_name = "node-x86_64-pc-windows-msvc.exe";

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let node_name = "node";

    // Sidecar binaries are in the resource dir root on bundled apps (with triple suffix)
    let node_path = resource_dir.join(node_name);
    if node_path.exists() {
        return Ok(node_path);
    }

    // Bundled apps may strip the triple suffix, leaving just "node" (or "node.exe" on Windows)
    #[cfg(target_os = "windows")]
    let plain_name = "node.exe";
    #[cfg(not(target_os = "windows"))]
    let plain_name = "node";

    let plain_path = resource_dir.join(plain_name);
    if plain_path.exists() {
        return Ok(plain_path);
    }

    // Development fallback: check binaries directory
    let dev_path = resource_dir.join("binaries").join(node_name);
    if dev_path.exists() {
        return Ok(dev_path);
    }

    Err(format!("Node binary not found at {:?}, {:?}, or {:?}", node_path, plain_path, dev_path))
}

fn get_resource_paths(
    app: &AppHandle,
) -> Result<(std::path::PathBuf, std::path::PathBuf, std::path::PathBuf), String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    let runtime_dir = resource_dir.join("resources").join("openclaw-runtime");
    let scripts_dir = resource_dir.join("resources").join("scripts");
    let templates_dir = resource_dir.join("resources").join("templates");

    Ok((runtime_dir, scripts_dir, templates_dir))
}

fn get_user_data_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))
}

/// Ensure openclaw.json has gateway.controlUi.dangerouslyDisableDeviceAuth = true
/// so the embedded dashboard window works without manual device pairing.
fn ensure_openclaw_config_auth(user_dir: &std::path::Path) {
    let config_path = user_dir.join("openclaw.json");

    let mut config: serde_json::Value = if config_path.exists() {
        std::fs::read_to_string(&config_path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    // Set gateway.controlUi.dangerouslyDisableDeviceAuth = true
    let gateway = config
        .as_object_mut()
        .unwrap()
        .entry("gateway")
        .or_insert_with(|| serde_json::json!({}));
    let control_ui = gateway
        .as_object_mut()
        .unwrap()
        .entry("controlUi")
        .or_insert_with(|| serde_json::json!({}));

    if control_ui.get("dangerouslyDisableDeviceAuth") != Some(&serde_json::Value::Bool(true)) {
        control_ui
            .as_object_mut()
            .unwrap()
            .insert("dangerouslyDisableDeviceAuth".to_string(), serde_json::json!(true));

        if let Some(parent) = config_path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap());
    }
}

fn build_clean_env() -> Vec<(String, String)> {
    let mut env: Vec<(String, String)> = Vec::new();

    let proxy_vars = [
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "ALL_PROXY",
        "http_proxy",
        "https_proxy",
        "all_proxy",
        "NO_PROXY",
        "no_proxy",
    ];

    // Pass through essential env vars, excluding proxy vars
    for (key, value) in std::env::vars() {
        if !proxy_vars.contains(&key.as_str()) {
            env.push((key, value));
        }
    }

    env
}

#[tauri::command]
fn get_gateway_status(process: State<'_, GatewayProcess>) -> GatewayState {
    process.state.lock().unwrap().clone()
}

#[tauri::command]
fn start_gateway(app: AppHandle, process: State<'_, GatewayProcess>) -> Result<(), String> {
    let mut child_lock = process.child.lock().unwrap();
    if child_lock.is_some() {
        return Err("Gateway is already running".to_string());
    }

    // Update status to starting
    {
        let mut state = process.state.lock().unwrap();
        state.status = GatewayStatus::Starting;
        state.last_error = None;
    }
    let _ = app.emit("gateway-status", GatewayStatus::Starting);

    let node_path = match get_node_binary_path(&app) {
        Ok(p) => p,
        Err(e) => {
            let mut state = process.state.lock().unwrap();
            state.status = GatewayStatus::Failed;
            state.last_error = Some(e.clone());
            let _ = app.emit("gateway-status", GatewayStatus::Failed);
            return Err(e);
        }
    };
    let (runtime_dir, scripts_dir, _templates_dir) = match get_resource_paths(&app) {
        Ok(p) => p,
        Err(e) => {
            let mut state = process.state.lock().unwrap();
            state.status = GatewayStatus::Failed;
            state.last_error = Some(e.clone());
            let _ = app.emit("gateway-status", GatewayStatus::Failed);
            return Err(e);
        }
    };
    let user_dir = match get_user_data_dir(&app) {
        Ok(p) => p,
        Err(e) => {
            let mut state = process.state.lock().unwrap();
            state.status = GatewayStatus::Failed;
            state.last_error = Some(e.clone());
            let _ = app.emit("gateway-status", GatewayStatus::Failed);
            return Err(e);
        }
    };

    // Ensure openclaw.json has controlUi.dangerouslyDisableDeviceAuth for local desktop use
    ensure_openclaw_config_auth(&user_dir);

    let start_script = scripts_dir.join("start-openclaw.cjs");
    if !start_script.exists() {
        let err = format!("Start script not found: {:?}", start_script);
        let mut state = process.state.lock().unwrap();
        state.status = GatewayStatus::Failed;
        state.last_error = Some(err.clone());
        let _ = app.emit("gateway-status", GatewayStatus::Failed);
        return Err(err);
    }

    let clean_env = build_clean_env();

    let mut cmd = Command::new(&node_path);
    cmd.arg(&start_script)
        .env_clear()
        .envs(clean_env)
        .env("OPENCLAW_RUNTIME_DIR", &runtime_dir)
        .env("OPENCLAW_USER_DIR", &user_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    match cmd.spawn() {
        Ok(mut child) => {
            let pid = child.id();

            // Spawn stdout reader
            if let Some(stdout) = child.stdout.take() {
                let app_clone = app.clone();
                std::thread::spawn(move || {
                    let reader = BufReader::new(stdout);
                    for line in reader.lines() {
                        if let Ok(line) = line {
                            let _ = app_clone.emit("gateway-log", serde_json::json!({
                                "stream": "stdout",
                                "line": line
                            }));
                        }
                    }
                });
            }

            // Spawn stderr reader
            if let Some(stderr) = child.stderr.take() {
                let app_clone = app.clone();
                std::thread::spawn(move || {
                    let reader = BufReader::new(stderr);
                    for line in reader.lines() {
                        if let Ok(line) = line {
                            let _ = app_clone.emit("gateway-log", serde_json::json!({
                                "stream": "stderr",
                                "line": line
                            }));
                        }
                    }
                });
            }

            *child_lock = Some(child);

            {
                let mut state = process.state.lock().unwrap();
                state.status = GatewayStatus::Running;
                state.pid = Some(pid);
            }
            let _ = app.emit("gateway-status", GatewayStatus::Running);

            // Spawn a thread to monitor process exit
            let app_clone = app.clone();
            std::thread::spawn(move || {
                // Wait a moment then start checking
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(1));
                    let gw = app_clone.state::<GatewayProcess>();
                    let mut child_lock = gw.child.lock().unwrap();
                    if let Some(ref mut child) = *child_lock {
                        match child.try_wait() {
                            Ok(Some(exit_status)) => {
                                let mut state = gw.state.lock().unwrap();
                                if exit_status.success() {
                                    state.status = GatewayStatus::Stopped;
                                } else {
                                    state.status = GatewayStatus::Failed;
                                    state.last_error = Some(format!(
                                        "Process exited with code: {:?}",
                                        exit_status.code()
                                    ));
                                }
                                state.pid = None;
                                let _ = app_clone.emit("gateway-status", state.status.clone());
                                *child_lock = None;
                                break;
                            }
                            Ok(None) => continue, // still running
                            Err(e) => {
                                let mut state = gw.state.lock().unwrap();
                                state.status = GatewayStatus::Failed;
                                state.last_error = Some(format!("Monitor error: {}", e));
                                state.pid = None;
                                let _ = app_clone.emit("gateway-status", GatewayStatus::Failed);
                                *child_lock = None;
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
            });

            Ok(())
        }
        Err(e) => {
            let err = format!("Failed to spawn process: {}", e);
            let mut state = process.state.lock().unwrap();
            state.status = GatewayStatus::Failed;
            state.last_error = Some(err.clone());
            let _ = app.emit("gateway-status", GatewayStatus::Failed);
            Err(err)
        }
    }
}

#[tauri::command]
fn stop_gateway(app: AppHandle, process: State<'_, GatewayProcess>) -> Result<(), String> {
    let mut child_lock = process.child.lock().unwrap();

    if let Some(ref mut child) = *child_lock {
        #[cfg(unix)]
        {
            // Send SIGTERM first
            unsafe {
                libc::kill(child.id() as i32, libc::SIGTERM);
            }

            // Wait up to 5 seconds
            for _ in 0..50 {
                std::thread::sleep(std::time::Duration::from_millis(100));
                if let Ok(Some(_)) = child.try_wait() {
                    break;
                }
            }

            // Force kill if still running
            if child.try_wait().map(|s| s.is_none()).unwrap_or(false) {
                let _ = child.kill();
            }
        }

        #[cfg(not(unix))]
        {
            let _ = child.kill();
        }

        let _ = child.wait();
        *child_lock = None;

        let mut state = process.state.lock().unwrap();
        state.status = GatewayStatus::Stopped;
        state.pid = None;
        let _ = app.emit("gateway-status", GatewayStatus::Stopped);

        Ok(())
    } else {
        Err("Gateway is not running".to_string())
    }
}

#[tauri::command]
fn restart_gateway(app: AppHandle, process: State<'_, GatewayProcess>) -> Result<(), String> {
    // Try to stop first (ignore error if not running)
    let _ = stop_gateway(app.clone(), process.clone());

    // Small delay
    std::thread::sleep(std::time::Duration::from_millis(500));

    start_gateway(app, process)
}

// --- User Data Management ---

#[tauri::command]
fn init_user_data_dir(app: AppHandle) -> Result<String, String> {
    let user_dir = get_user_data_dir(&app)?;
    let subdirs = ["config", "extensions", "logs", "state"];

    for sub in &subdirs {
        let dir = user_dir.join(sub);
        std::fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create {}: {}", sub, e))?;
    }

    // Copy default config if missing
    let config_dest = user_dir.join("config").join("app-config.json");
    if !config_dest.exists() {
        let (_, _, templates_dir) = get_resource_paths(&app)?;
        let config_src = templates_dir.join("config.default.json");
        if config_src.exists() {
            std::fs::copy(&config_src, &config_dest)
                .map_err(|e| format!("Failed to copy default config: {}", e))?;
        }
    }

    // Init runtime state if missing
    let state_path = user_dir.join("state").join("runtime.json");
    if !state_path.exists() {
        let state = serde_json::json!({
            "lastBootstrap": chrono::Utc::now().to_rfc3339(),
            "pid": null,
            "status": "stopped"
        });
        std::fs::write(&state_path, serde_json::to_string_pretty(&state).unwrap())
            .map_err(|e| format!("Failed to write runtime state: {}", e))?;
    }

    Ok(user_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn copy_plugin_to_extensions(app: AppHandle) -> Result<bool, String> {
    let user_dir = get_user_data_dir(&app)?;
    let (runtime_dir, _, _) = get_resource_paths(&app)?;

    let plugin_name = "@larksuiteoapi/feishu-openclaw-plugin";
    let plugin_dest = user_dir.join("extensions").join(plugin_name);

    if plugin_dest.exists() {
        return Ok(false); // Already exists
    }

    let plugin_src = runtime_dir.join("node_modules").join(plugin_name);
    if !plugin_src.exists() {
        return Ok(false); // Source plugin not available
    }

    copy_dir_recursive(&plugin_src, &plugin_dest)
        .map_err(|e| format!("Failed to copy plugin: {}", e))?;

    Ok(true)
}

fn copy_dir_recursive(src: &std::path::Path, dest: &std::path::Path) -> std::io::Result<()> {
    std::fs::create_dir_all(dest)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let dest_path = dest.join(entry.file_name());
        if entry.file_type()?.is_dir() {
            copy_dir_recursive(&entry.path(), &dest_path)?;
        } else {
            std::fs::copy(entry.path(), &dest_path)?;
        }
    }
    Ok(())
}

#[tauri::command]
fn save_runtime_state(app: AppHandle, status: String, pid: Option<u32>) -> Result<(), String> {
    let user_dir = get_user_data_dir(&app)?;
    let state_path = user_dir.join("state").join("runtime.json");

    let state = serde_json::json!({
        "lastUpdate": chrono::Utc::now().to_rfc3339(),
        "pid": pid,
        "status": status
    });

    std::fs::write(&state_path, serde_json::to_string_pretty(&state).unwrap())
        .map_err(|e| format!("Failed to write runtime state: {}", e))?;

    Ok(())
}

#[tauri::command]
fn read_config(app: AppHandle) -> Result<serde_json::Value, String> {
    let user_dir = get_user_data_dir(&app)?;
    let config_path = user_dir.join("config").join("app-config.json");

    if !config_path.exists() {
        return Err("Config file not found".to_string());
    }

    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))
}

#[tauri::command]
fn write_config(app: AppHandle, config: serde_json::Value) -> Result<(), String> {
    let user_dir = get_user_data_dir(&app)?;
    let config_path = user_dir.join("config").join("app-config.json");

    std::fs::create_dir_all(config_path.parent().unwrap())
        .map_err(|e| format!("Failed to create config dir: {}", e))?;

    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(())
}

#[tauri::command]
fn check_setup_complete(app: AppHandle) -> Result<bool, String> {
    let user_dir = get_user_data_dir(&app)?;
    let config_path = user_dir.join("config").join("app-config.json");

    if !config_path.exists() {
        return Ok(false);
    }

    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    let config: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    Ok(config.get("app")
        .and_then(|a| a.get("setupCompleted"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false))
}

#[tauri::command]
fn get_diagnostics_info(app: AppHandle) -> Result<serde_json::Value, String> {
    let user_dir = get_user_data_dir(&app)?;
    let (runtime_dir, _, _) = get_resource_paths(&app)?;

    let node_exists = get_node_binary_path(&app).is_ok();
    let openclaw_exists = runtime_dir.join("node_modules").join("openclaw").exists();
    let plugin_exists = runtime_dir.join("node_modules").join("@larksuiteoapi/feishu-openclaw-plugin").exists();

    let proxy_vars: Vec<String> = ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]
        .iter()
        .filter_map(|v| std::env::var(v).ok().map(|val| format!("{}={}", v, val)))
        .collect();

    let mut config_dirs = serde_json::Map::new();
    for sub in &["config", "extensions", "logs", "state"] {
        config_dirs.insert(sub.to_string(), serde_json::Value::Bool(user_dir.join(sub).exists()));
    }

    Ok(serde_json::json!({
        "nodeAvailable": node_exists,
        "nodePath": get_node_binary_path(&app).unwrap_or_default().to_string_lossy().to_string(),
        "openclawAvailable": openclaw_exists,
        "pluginAvailable": plugin_exists,
        "userDataDir": user_dir.to_string_lossy().to_string(),
        "runtimeDir": runtime_dir.to_string_lossy().to_string(),
        "proxyVarsDetected": proxy_vars,
        "configDirs": serde_json::Value::Object(config_dirs)
    }))
}

// --- Autostart Management ---

#[tauri::command]
fn enable_autostart(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .enable()
        .map_err(|e| format!("Failed to enable autostart: {}", e))
}

#[tauri::command]
fn disable_autostart(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .disable()
        .map_err(|e| format!("Failed to disable autostart: {}", e))
}

#[tauri::command]
fn is_autostart_enabled(app: AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch()
        .is_enabled()
        .map_err(|e| format!("Failed to check autostart: {}", e))
}

fn should_auto_start_gateway(app: &AppHandle) -> bool {
    let user_dir = match get_user_data_dir(app) {
        Ok(d) => d,
        Err(_) => return false,
    };
    let config_path = user_dir.join("config").join("app-config.json");
    let content = match std::fs::read_to_string(&config_path) {
        Ok(c) => c,
        Err(_) => return false,
    };
    let config: serde_json::Value = match serde_json::from_str(&content) {
        Ok(c) => c,
        Err(_) => return false,
    };
    config
        .get("app")
        .and_then(|a| a.get("autoStartGateway"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}

// --- Tray & Window ---

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let show_i = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let start_i = MenuItem::with_id(app, "start_gw", "Start Gateway", true, None::<&str>)?;
    let stop_i = MenuItem::with_id(app, "stop_gw", "Stop Gateway", true, None::<&str>)?;
    let restart_i = MenuItem::with_id(app, "restart_gw", "Restart Gateway", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_i, &start_i, &stop_i, &restart_i, &quit_i])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().cloned().unwrap())
        .tooltip("OpenClaw Desktop")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app: &AppHandle, event: tauri::menu::MenuEvent| match event.id().as_ref() {
            "show" => show_main_window(app),
            "start_gw" => {
                let gw = app.state::<GatewayProcess>();
                let _ = start_gateway(app.clone(), gw);
            }
            "stop_gw" => {
                let gw = app.state::<GatewayProcess>();
                let _ = stop_gateway(app.clone(), gw);
            }
            "restart_gw" => {
                let gw = app.state::<GatewayProcess>();
                let _ = restart_gateway(app.clone(), gw);
            }
            "quit" => {
                let gw = app.state::<GatewayProcess>();
                let _ = stop_gateway(app.clone(), gw);
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray: &TrayIcon, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(GatewayProcess::default())
        .setup(|app| {
            setup_tray(app)?;

            // Auto-start gateway if configured
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                if should_auto_start_gateway(&handle) {
                    let gw = handle.state::<GatewayProcess>();
                    let _ = start_gateway(handle.clone(), gw);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_gateway_status,
            start_gateway,
            stop_gateway,
            restart_gateway,
            init_user_data_dir,
            copy_plugin_to_extensions,
            save_runtime_state,
            read_config,
            write_config,
            check_setup_complete,
            get_diagnostics_info,
            enable_autostart,
            disable_autostart,
            is_autostart_enabled,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
