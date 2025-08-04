use crate::app_state::AppState;
use crate::tasks::shell_task::{ShellJob, ShellType, TaskNotify, TaskStatus};
use crate::utils::{now_sec, HomeType};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use std::sync::Arc;
use tauri::{Emitter, State};
use tauri_specta::{collect_commands, Builder};
use tokio::sync::RwLock;

mod app_state;
mod err;
mod utils;

mod tasks {
    pub mod shell_task;
}

use crate::err::Result;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
#[specta::specta]
async fn run_shell(
    state: State<'_, AppState>,
    window: tauri::Window,
    shell_job: ShellJob,
) -> Result<()> {
    let shell_task = shell_job.make_task()?;
    window.emit(
        tasks::shell_task::EVENT_NAME,
        TaskNotify {
            task_id: shell_task.task_id.clone(),
            task_status: TaskStatus::Begin,
            exit_code: None,
            message: "Begin".to_string(),
            tm_sec: now_sec(),
        },
    )?;
    match shell_task.run(state, window.clone()).await {
        Ok(exit_code) => {
            window.emit(
                tasks::shell_task::EVENT_NAME,
                TaskNotify {
                    task_id: shell_task.task_id.clone(),
                    task_status: TaskStatus::End,
                    exit_code,
                    message: "End".to_string(),
                    tm_sec: now_sec(),
                },
            )?;
        }
        Err(e) => {
            window.emit(
                tasks::shell_task::EVENT_NAME,
                TaskNotify {
                    task_id: shell_task.task_id.clone(),
                    task_status: TaskStatus::End,
                    exit_code: None,
                    message: e.to_string(),
                    tm_sec: now_sec(),
                },
            )?;
        }
    };
    Ok(())
}

#[tauri::command]
#[specta::specta]
async fn stop_shell(state: State<'_, AppState>, task_id: String) -> Result<()> {
    tasks::shell_task::stop(state, task_id).await
}

#[tauri::command]
#[specta::specta]
async fn get_media_info(url: String) -> Result<String> {
    let shell_job = ShellJob {
        task_id: "".to_string(),
        shell_type: ShellType::YtDlp,
        args: vec!["--dump-json".to_string(), url],
        shell: None,
        working_dir: None,
        encoding: None,
    };
    let shell_task = shell_job.make_task()?;
    tasks::shell_task::get_media_info(&shell_task).await
}

#[tauri::command]
#[specta::specta]
async fn get_home_dir() -> Result<HashMap<HomeType, String>> {
    utils::get_home_dir().await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        run_shell,
        stop_shell,
        get_media_info,
        get_home_dir,
    ]);

    #[cfg(debug_assertions)]
    {
        use crate::tasks::shell_task::TaskNotify;
        use specta::TypeCollection;
        use specta_typescript::BigIntExportBehavior;
        use specta_typescript::Typescript;

        let bindings_path = Path::new("../src/bindings.ts");

        let ts = Typescript::default().bigint(BigIntExportBehavior::Number);
        builder
            .export(ts.clone(), bindings_path)
            .expect("Failed to export typescript bindings");

        let mut types = TypeCollection::default();
        types.register::<TaskNotify>();
        let task_notify_str = ts.clone().export(&types).unwrap();
        let mut file = OpenOptions::new()
            .append(true)
            .create(true)
            .open(bindings_path)
            .unwrap();
        file.write_all(task_notify_str.as_bytes()).unwrap();
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            shell_handles: Arc::new(RwLock::new(HashMap::new())),
        })
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            builder.mount_events(app);
            Ok(())
        })
        // .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
