// Opens Claude Code, the Claude app and web pages, and runs Anthropic's
// official Claude Code installer in a visible terminal.
use crate::detect::{hidden, home};
use std::path::Path;
use std::process::Command;

fn spawn(cmd: &mut Command) -> Result<(), String> {
    cmd.spawn().map(|_| ()).map_err(|e| e.to_string())
}

/// Runs a command in a new Terminal window on macOS.
#[cfg(not(windows))]
fn in_terminal(script: &str) -> Result<(), String> {
    let script = script.replace('\\', "\\\\").replace('"', "\\\"");
    spawn(Command::new("osascript").args([
        "-e", "tell application \"Terminal\"",
        "-e", "activate",
        "-e", &format!("do script \"{script}\""),
        "-e", "end tell",
    ]))
}

/// Signed out is fine: Claude Code asks to log in when it starts.
#[tauri::command]
pub fn open_code(path: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        let dir = Path::new(&path).parent().ok_or("chemin invalide")?;
        let mut paths = vec![dir.to_path_buf()];
        paths.extend(std::env::split_paths(&std::env::var_os("PATH").unwrap_or_default()));
        let joined = std::env::join_paths(paths).map_err(|e| e.to_string())?;
        spawn(
            hidden(&mut Command::new("cmd"))
                .args(["/c", "start", "Claude Code", "cmd", "/k", "claude"])
                .env("PATH", joined)
                .current_dir(home()),
        )
    }
    #[cfg(not(windows))]
    in_terminal(&format!("cd ~ && '{}'", path.replace('\'', "'\\''")))
}

#[tauri::command]
pub fn install_code() -> Result<(), String> {
    #[cfg(windows)]
    {
        // PowerShell 5 needs the BOM to read the accents
        let script = std::env::temp_dir().join("claudepanel-install-code.ps1");
        let mut bytes = vec![0xEF, 0xBB, 0xBF];
        bytes.extend_from_slice(include_str!("../scripts/install-code.ps1").as_bytes());
        std::fs::write(&script, bytes).map_err(|e| e.to_string())?;
        spawn(hidden(&mut Command::new("cmd")).arg("/c").arg("start").arg("Installation de Claude Code").args([
            "powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
        ]).arg(&script))
    }
    #[cfg(not(windows))]
    in_terminal(
        "clear; echo; echo '  Installation de Claude Code (script officiel d’Anthropic)'; echo; \
         curl -fsSL https://claude.ai/install.sh | bash && \
         echo && echo '  C’est fait ! Retourne sur ClaudePanel et clique sur Claude Code pour te connecter.'",
    )
}

#[tauri::command]
pub fn open_app(app: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        if app == "msix" {
            spawn(Command::new("explorer.exe").arg(r"shell:AppsFolder\Claude_pzs8sxrjxfjjc!Claude"))
        } else {
            spawn(&mut Command::new(app))
        }
    }
    #[cfg(not(windows))]
    spawn(Command::new("open").arg("-a").arg(app))
}

/// Web pages only, in the default browser.
#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("adresse refusée".into());
    }
    #[cfg(windows)]
    return spawn(Command::new("explorer.exe").arg(url));
    #[cfg(not(windows))]
    spawn(Command::new("open").arg(url))
}

#[tauri::command]
pub fn quit(app: tauri::AppHandle) {
    app.exit(0);
}
