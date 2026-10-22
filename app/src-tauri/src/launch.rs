// Opens Claude Code, the Claude app and web pages, and runs Anthropic's
// official Claude Code installer in a visible terminal.
use crate::detect::{app_location, code_path, hidden, home};
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
/// Only the Claude Code found on this machine, whatever the page asks for.
#[tauri::command]
pub fn open_code(path: String) -> Result<(), String> {
    let found = code_path().ok_or("err.noCode")?;
    if Path::new(&path) != found {
        return Err("err.badName".into());
    }
    #[cfg(windows)]
    {
        let dir = Path::new(&path).parent().ok_or("err.badName")?;
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

/// What the installer window says, in the user's language (from i18n.js).
/// `source` holds {url}; `fail` may hold PowerShell's $_ (the error).
#[derive(serde::Deserialize)]
pub struct InstallTexts {
    title: String,
    source: String,
    ok: String,
    fail: String,
    check: String,
    close: String,
}

#[tauri::command]
pub fn install_code(texts: InstallTexts) -> Result<(), String> {
    #[cfg(windows)]
    {
        // Inside PowerShell double quotes: escape backticks and quotes, keep $_
        let ps = |s: &str| s.replace('`', "``").replace('"', "`\"");
        let source = texts.source.replace("{url}", "https://claude.ai/install.ps1");
        let body = include_str!("../scripts/install-code.ps1")
            .replace("{TITLE}", &ps(&texts.title))
            .replace("{SOURCE}", &ps(&source))
            .replace("{OK}", &ps(&texts.ok))
            .replace("{FAIL}", &ps(&texts.fail))
            .replace("{CHECK}", &ps(&texts.check))
            .replace("{CLOSE}", &ps(&texts.close));
        // PowerShell 5 needs the BOM to read accents
        let script = std::env::temp_dir().join("claudepanel-install-code.ps1");
        let mut bytes = vec![0xEF, 0xBB, 0xBF];
        bytes.extend_from_slice(body.as_bytes());
        std::fs::write(&script, bytes).map_err(|e| e.to_string())?;
        spawn(hidden(&mut Command::new("cmd")).arg("/c").arg("start").arg(&texts.title).args([
            "powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
        ]).arg(&script))
    }
    #[cfg(not(windows))]
    {
        // Inside sh single quotes
        let sh = |s: &str| format!("'{}'", s.replace('\'', "'\\''"));
        let source = texts.source.replace("{url}", "https://claude.ai/install.sh");
        let _ = (&texts.fail, &texts.check, &texts.close);
        in_terminal(&format!(
            "clear; echo; echo {}; echo {}; echo; curl -fsSL https://claude.ai/install.sh | bash && echo && echo {}",
            sh(&format!("  {}", texts.title)),
            sh(&format!("  {source}")),
            sh(&format!("  {}", texts.ok)),
        ))
    }
}

/// Only the Claude app found on this machine, whatever the page asks for.
#[tauri::command]
pub fn open_app(app: String) -> Result<(), String> {
    if app_location().as_deref() != Some(app.as_str()) {
        return Err("err.badName".into());
    }
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
        return Err("err.badName".into());
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
