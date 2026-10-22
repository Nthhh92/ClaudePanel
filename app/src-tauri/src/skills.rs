// Lists installed skills and the plugins available to install, and installs or
// removes them through the `claude plugin` command line.
use crate::detect::{claude_command, home, read_json};
use serde::Serialize;
use serde_json::Value;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
struct Skill {
    name: String,
    command: String,
    description: String,
}

#[derive(Serialize)]
struct Group {
    plugin: String,
    /// plugin@marketplace, empty for skills that are not a plugin
    id: String,
    skills: Vec<Skill>,
}

#[derive(Serialize)]
pub struct Lists {
    installed: Vec<Group>,
    available: Vec<Value>,
    /// Plugin details by id (skill names), from Claude Code's catalog cache
    catalog: Value,
}

#[tauri::command]
pub async fn skills_list() -> Result<Lists, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let plugins = home().join(".claude").join("plugins");
        let available = run_claude(&["plugin", "list", "--json", "--available"])
            .ok()
            .and_then(|out| serde_json::from_str::<Value>(&out).ok())
            .and_then(|j| j["available"].as_array().cloned())
            .unwrap_or_default();
        let catalog = read_json(&plugins.join("plugin-catalog-cache.json"))
            .map(|j| j["catalog"]["plugins"].clone())
            .unwrap_or(Value::Null);
        Lists { installed: installed_groups(), available, catalog }
    })
    .await
    .map_err(|e| e.to_string())
}

/// action: install | uninstall | add (a GitHub marketplace, owner/repo)
#[tauri::command]
pub async fn skills_action(action: String, arg: String) -> Result<String, String> {
    if arg.is_empty() || !arg.chars().all(|c| c.is_ascii_alphanumeric() || "@._/:-".contains(c)) {
        return Err("err.badName".into());
    }
    tauri::async_runtime::spawn_blocking(move || match action.as_str() {
        "install" => run_claude(&["plugin", "install", &arg]),
        "uninstall" => run_claude(&["plugin", "uninstall", &arg]),
        "add" => run_claude(&["plugin", "marketplace", "add", &arg]),
        _ => Err("err.badName".into()),
    })
    .await
    .map_err(|e| e.to_string())?
}

fn run_claude(args: &[&str]) -> Result<String, String> {
    let mut cmd = claude_command().ok_or("err.noCode")?;
    let out = cmd.args(args).output().map_err(|e| e.to_string())?;
    let text = String::from_utf8_lossy(&out.stdout).into_owned();
    if out.status.success() {
        Ok(text)
    } else {
        Err(format!("{}{}", text, String::from_utf8_lossy(&out.stderr)))
    }
}

fn installed_groups() -> Vec<Group> {
    let claude = home().join(".claude");
    let mut groups = Vec::new();

    // Plugins
    if let Some(j) = read_json(&claude.join("plugins").join("installed_plugins.json")) {
        if let Some(plugins) = j["plugins"].as_object() {
            for (id, installs) in plugins {
                let name = id.split('@').next().unwrap_or(id).to_string();
                let Some(path) = installs[0]["installPath"].as_str().map(Path::new) else { continue };
                let mut skills = skills_in(&path.join("skills"), &format!("{name}:"));
                let root = path.join("SKILL.md");
                if root.is_file() {
                    skills.push(skill(&name, format!("/{name}:{name}"), &root));
                }
                if let Ok(cmds) = fs::read_dir(path.join("commands")) {
                    for f in cmds.flatten().map(|e| e.path()).filter(|p| p.extension().map_or(false, |x| x == "md")) {
                        let stem = f.file_stem().unwrap_or_default().to_string_lossy().into_owned();
                        skills.push(skill(&stem, format!("/{name}:{stem}"), &f));
                    }
                }
                groups.push(Group { plugin: name, id: id.clone(), skills });
            }
        }
    }

    // Personal skills (~/.claude/skills/<name>)
    let personal = skills_in(&claude.join("skills"), "");
    if !personal.is_empty() {
        groups.push(Group { plugin: "Mes skills".into(), id: String::new(), skills: personal });
    }

    // Skills synced from claude.ai (~/.claude/skills/synced/<id>/<name>)
    let mut synced = Vec::new();
    if let Ok(dirs) = fs::read_dir(claude.join("skills").join("synced")) {
        for d in dirs.flatten() {
            synced.extend(skills_in(&d.path(), "anthropic-skills:"));
        }
    }
    if !synced.is_empty() {
        groups.push(Group { plugin: "Claude.ai".into(), id: String::new(), skills: synced });
    }
    groups
}

/// Skills in <root>/<name>/SKILL.md, one level deep like Claude Code does
fn skills_in(root: &Path, prefix: &str) -> Vec<Skill> {
    let Ok(entries) = fs::read_dir(root) else { return Vec::new() };
    let mut out: Vec<Skill> = entries
        .flatten()
        .filter_map(|e| {
            let md = e.path().join("SKILL.md");
            let name = e.file_name().to_string_lossy().into_owned();
            md.is_file().then(|| skill(&name, format!("/{prefix}{name}"), &md))
        })
        .collect();
    out.sort_by(|a, b| a.name.cmp(&b.name));
    out
}

fn skill(name: &str, command: String, file: &Path) -> Skill {
    Skill { name: name.into(), command, description: description(file) }
}

/// The `description:` line of the front matter
fn description(file: &Path) -> String {
    fs::read_to_string(file)
        .unwrap_or_default()
        .lines()
        .take(30)
        .find_map(|l| l.strip_prefix("description:"))
        .map(|d| d.trim().trim_matches(|c| c == '"' || c == '\'').to_string())
        .unwrap_or_default()
}
