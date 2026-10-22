// ClaudePanel 1.x (the HTA panel) used the same "Apps" entry as this version.
// The installer notes where it was (windows/hooks.nsh); on first launch we keep
// its first name and remove it: files, shortcuts, open window.
use tauri::AppHandle;

#[cfg(windows)]
pub fn run(app: &AppHandle) {
    use crate::detect::hidden;
    use std::path::PathBuf;
    use std::process::Command;
    use winreg::{enums::*, RegKey};

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let Ok(key) = hkcu.open_subkey_with_flags(r"Software\ClaudePanel", KEY_READ | KEY_WRITE) else { return };
    let Ok(dir) = key.get_value::<String, _>("LegacyDir") else { return };
    let dir = PathBuf::from(dir);

    if dir.join("panel.hta").is_file() {
        crate::settings::adopt_name(app, &dir.join("data").join("user.json"));
        // PowerShell 5 needs the BOM to read the accents
        let script = std::env::temp_dir().join("claudepanel-remove-v1.ps1");
        let mut bytes = vec![0xEF, 0xBB, 0xBF];
        bytes.extend_from_slice(include_str!("../scripts/remove-v1.ps1").as_bytes());
        if std::fs::write(&script, bytes).is_ok() {
            let _ = hidden(&mut Command::new("powershell"))
                .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File"])
                .arg(&script)
                .arg("-Dir")
                .arg(&dir)
                .arg("-App")
                .arg(std::env::current_exe().unwrap_or_default())
                .spawn();
        }
    }
    let _ = key.delete_value("LegacyDir");
    drop(key);
    let _ = hkcu.delete_subkey(r"Software\ClaudePanel");
}

#[cfg(not(windows))]
pub fn run(_app: &AppHandle) {}
