// The user's first name and whether the welcome tour was done, plus the
// in-app uninstall (so the goodbye can be shown before the app is removed).
use crate::detect::hidden;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Default)]
pub struct Settings {
    #[serde(default)]
    name: String,
    #[serde(default)]
    onboarded: bool,
}

fn file(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app.path().app_config_dir().map_err(|e| e.to_string())?.join("settings.json"))
}

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Settings {
    file(&app)
        .ok()
        .and_then(|f| std::fs::read_to_string(f).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    let f = file(&app)?;
    std::fs::create_dir_all(f.parent().unwrap()).map_err(|e| e.to_string())?;
    std::fs::write(f, serde_json::to_string(&settings).unwrap()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn platform() -> &'static str {
    std::env::consts::OS
}

/// Deletes the settings now, and schedules the removal of the app itself for
/// as soon as this process exits (the goodbye stays on screen until then).
#[tauri::command]
pub fn uninstall_self(app: AppHandle) -> Result<(), String> {
    let paths = app.path();
    let data: Vec<PathBuf> = [paths.app_config_dir(), paths.app_data_dir(), paths.app_local_data_dir()]
        .into_iter()
        .flatten()
        .collect();
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let pid = std::process::id();

    #[cfg(windows)]
    {
        // Tauri's NSIS installer puts its uninstaller next to the exe
        let uninstaller = exe.with_file_name("uninstall.exe");
        if !uninstaller.is_file() {
            return Err("Désinstallation introuvable : ClaudePanel n’a pas été installé avec son installateur.".into());
        }
        let quote = |p: &PathBuf| format!("'{}'", p.display().to_string().replace('\'', "''"));
        let wipe: Vec<String> = data.iter().map(|d| format!("Remove-Item -Recurse -Force -ErrorAction SilentlyContinue {}", quote(d))).collect();
        let script = format!(
            "Wait-Process -Id {pid} -ErrorAction SilentlyContinue; Start-Process -Wait {} -ArgumentList '/S'; {}",
            quote(&uninstaller),
            wipe.join("; ")
        );
        hidden(&mut Command::new("powershell"))
            .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &script])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(windows))]
    {
        // .../ClaudePanel.app/Contents/MacOS/claudepanel
        let bundle = exe.ancestors().nth(3).ok_or("app introuvable")?.to_path_buf();
        let q = |p: &PathBuf| format!("'{}'", p.display().to_string().replace('\'', "'\\''"));
        let wipe: Vec<String> = data.iter().map(|d| format!("rm -rf {}", q(d))).collect();
        let script = format!(
            "while kill -0 {pid} 2>/dev/null; do sleep 0.5; done; {}; \
             osascript -e 'tell application \"Finder\" to delete POSIX file \"{}\"'",
            wipe.join("; "),
            bundle.display()
        );
        Command::new("sh").args(["-c", &script]).spawn().map_err(|e| e.to_string())?;
    }
    Ok(())
}
