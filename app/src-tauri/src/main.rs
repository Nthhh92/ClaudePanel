// ClaudePanel: a small home screen to open Claude Code, the Claude app and
// manage skills. The UI lives in ../ui; this side detects, launches and
// installs things on the machine.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ai;
mod detect;
mod launch;
mod migrate;
mod settings;
mod skills;
mod update;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(update::Pending::default())
        .setup(|app| {
            migrate::run(app.handle());
            Ok(())
        })
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
            update::check_update,
            update::install_update,
            ai::ai_understand,
            ai::ai_pick,
        ])
        .run(tauri::generate_context!())
        .expect("ClaudePanel n'a pas pu démarrer");
}
