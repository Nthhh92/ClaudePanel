// Finds Claude Code and the Claude app, and whether each is signed in.
// Only looks at local files and the registry: nothing is sent anywhere.
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Serialize)]
pub struct Env {
    /// Path to the claude executable, if installed
    code: Option<String>,
    code_in: bool,
    /// "msix" (Windows Store install) or a path to launch, if installed
    app: Option<String>,
    app_in: bool,
}

#[tauri::command]
pub fn detect() -> Env {
    let code = code_path().map(|p| p.to_string_lossy().into_owned());
    let app = app_location();
    Env {
        code_in: code.is_some() && code_signed_in(),
        app_in: app.is_some() && app_signed_in(),
        code,
        app,
    }
}

pub fn home() -> PathBuf {
    let var = if cfg!(windows) { "USERPROFILE" } else { "HOME" };
    PathBuf::from(std::env::var_os(var).unwrap_or_default())
}

/// Starts a program without flashing a console window on Windows.
pub fn hidden(cmd: &mut Command) -> &mut Command {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    cmd
}

pub fn code_path() -> Option<PathBuf> {
    let names: &[&str] = if cfg!(windows) { &["claude.exe", "claude.cmd"] } else { &["claude"] };
    search_dirs()
        .into_iter()
        .flat_map(|d| names.iter().map(move |n| d.join(n)))
        .find(|p| p.is_file())
}

/// A command that runs Claude Code. An npm install only has claude.cmd, whose
/// arguments cmd.exe would mangle: run its script with node directly instead.
pub fn claude_command() -> Option<Command> {
    let exe = code_path()?;
    if exe.extension().map_or(false, |e| e == "cmd") {
        let script = exe.with_file_name(r"node_modules\@anthropic-ai\claude-code\cli.js");
        let mut cmd = Command::new("node");
        cmd.arg(script);
        hidden(&mut cmd);
        return Some(cmd);
    }
    let mut cmd = Command::new(exe);
    hidden(&mut cmd);
    Some(cmd)
}

fn search_dirs() -> Vec<PathBuf> {
    let home = home();
    let mut dirs = vec![home.join(".local").join("bin")];
    #[cfg(windows)]
    {
        if let Some(appdata) = std::env::var_os("APPDATA") {
            dirs.push(PathBuf::from(appdata).join("npm"));
        }
        // This process's PATH is frozen at launch: after an install, the live
        // one is in the registry
        for p in [registry_user("Path"), registry_machine_path()].into_iter().flatten() {
            dirs.extend(std::env::split_paths(&expand(&p)));
        }
    }
    #[cfg(not(windows))]
    {
        dirs.push("/opt/homebrew/bin".into());
        dirs.push("/usr/local/bin".into());
        dirs.push(home.join(".npm-global").join("bin"));
    }
    if let Some(path) = std::env::var_os("PATH") {
        dirs.extend(std::env::split_paths(&path));
    }
    dirs
}

fn code_signed_in() -> bool {
    let home = home();
    if home.join(".claude").join(".credentials.json").is_file() || std::env::var_os("ANTHROPIC_API_KEY").is_some() {
        return true;
    }
    #[cfg(windows)]
    if registry_user("ANTHROPIC_API_KEY").is_some() {
        return true;
    }
    read_json(&home.join(".claude.json")).map_or(false, |j| j["oauthAccount"].is_object())
}

fn app_location() -> Option<String> {
    #[cfg(windows)]
    {
        let local = PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap_or_default());
        if local.join("Packages").join("Claude_pzs8sxrjxfjjc").is_dir() {
            return Some("msix".into());
        }
        let exe = local.join("AnthropicClaude").join("claude.exe");
        return exe.is_file().then(|| exe.to_string_lossy().into_owned());
    }
    #[cfg(not(windows))]
    {
        [PathBuf::from("/Applications/Claude.app"), home().join("Applications").join("Claude.app")]
            .into_iter()
            .find(|p| p.is_dir())
            .map(|p| p.to_string_lossy().into_owned())
    }
}

fn app_signed_in() -> bool {
    let mut configs = Vec::new();
    #[cfg(windows)]
    {
        let local = PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap_or_default());
        // Since app 3.1623.1 its data lives in Claude-Data\<package>; before, in the package's LocalCache
        if let Ok(dirs) = fs::read_dir(local.join("Claude-Data")) {
            configs.extend(dirs.flatten().map(|d| d.path().join("config.json")));
        }
        configs.push(local.join(r"Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\config.json"));
        if let Some(appdata) = std::env::var_os("APPDATA") {
            configs.push(PathBuf::from(appdata).join("Claude").join("config.json"));
        }
    }
    #[cfg(not(windows))]
    configs.push(home().join("Library/Application Support/Claude/config.json"));

    configs.iter().filter_map(|c| read_json(c)).any(|j| {
        ["oauth:tokenCache", "oauth:tokenCacheV2"]
            .iter()
            .any(|k| j[k].as_str().map_or(false, |v| !v.is_empty()))
    })
}

pub fn read_json(path: &Path) -> Option<serde_json::Value> {
    serde_json::from_str(&fs::read_to_string(path).ok()?).ok()
}

#[cfg(windows)]
fn registry_user(name: &str) -> Option<String> {
    use winreg::{enums::HKEY_CURRENT_USER, RegKey};
    RegKey::predef(HKEY_CURRENT_USER).open_subkey("Environment").ok()?.get_value(name).ok()
}

#[cfg(windows)]
fn registry_machine_path() -> Option<String> {
    use winreg::{enums::HKEY_LOCAL_MACHINE, RegKey};
    RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey(r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment")
        .ok()?
        .get_value("Path")
        .ok()
}

/// Expands %VARIABLES% the way the registry stores them in PATH.
#[cfg(windows)]
fn expand(s: &str) -> String {
    let mut out = String::new();
    let mut parts = s.split('%');
    out.push_str(parts.next().unwrap_or(""));
    let mut inside = true;
    for part in parts {
        if inside {
            match std::env::var(part) {
                Ok(v) if !part.is_empty() => out.push_str(&v),
                _ => { out.push('%'); out.push_str(part); out.push('%'); }
            }
        } else {
            out.push_str(part);
        }
        inside = !inside;
    }
    out
}
