// ClaudePanel: a small home screen to open Claude Code, the Claude app and
// manage skills. The UI lives in ../ui; this side detects, launches and
// installs things on the machine.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod detect;
mod launch;
mod settings;
mod skills;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            detect::detect,
            launch::open_code,
            launch::install_code,
            launch::open_app,
            launch::open_url,
            launch::quit,
            skills::skills_list,
            skills::skills_action,
            settings::get_settings,
            settings::save_settings,
            settings::platform,
            settings::uninstall_self,
        ])
        .run(tauri::generate_context!())
        .expect("ClaudePanel n'a pas pu démarrer");
}
