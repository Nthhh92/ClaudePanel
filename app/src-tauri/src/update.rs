// Checks for new versions, downloads and installs them. Packages are signed:
// the app only accepts ones signed with the key whose public half is in
// tauri.conf.json (plugins.updater.pubkey).
use serde::Serialize;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_updater::{Update, Updater, UpdaterExt};

/// The update found by the last check, waiting for the user to accept it
#[derive(Default)]
pub struct Pending(Mutex<Option<Update>>);

#[derive(Serialize)]
pub struct Available {
    version: String,
    notes: String,
}

fn updater(app: &AppHandle) -> Result<Updater, String> {
    app.updater_builder().build().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_update(app: AppHandle, pending: State<'_, Pending>) -> Result<Option<Available>, String> {
    let update = updater(&app)?.check().await.map_err(|e| e.to_string())?;
    let found = update.as_ref().map(|u| Available {
        version: u.version.clone(),
        notes: u.body.clone().unwrap_or_default(),
    });
    *pending.0.lock().unwrap() = update;
    Ok(found)
}

/// Downloads (reporting "update-progress" from 0 to 1), installs, restarts.
#[tauri::command]
pub async fn install_update(app: AppHandle, pending: State<'_, Pending>) -> Result<(), String> {
    let update = pending.0.lock().unwrap().take().ok_or("Aucune mise à jour en attente")?;
    let progress = app.clone();
    let mut received = 0usize;
    update
        .download_and_install(
            move |chunk, total| {
                received += chunk;
                if let Some(total) = total {
                    let _ = progress.emit("update-progress", received as f64 / total as f64);
                }
            },
            || {},
        )
        .await
        .map_err(|e| e.to_string())?;
    // On Windows the installer has already closed the app and starts it again
    app.restart()
}
