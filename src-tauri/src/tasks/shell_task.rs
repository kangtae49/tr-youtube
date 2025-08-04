use encoding::{DecoderTrap, Encoding};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, skip_serializing_none};
use specta::Type;
use std::io::Write;
use std::path::{absolute, Path};
use std::process::Stdio;

use std::sync::Arc;
use tauri::{Emitter, State};
use tokio::io::{AsyncBufReadExt, AsyncRead, BufReader};
use tokio::process::Command;
use tokio::sync::RwLock;
use tokio::task::JoinHandle;
use windows::Win32::System::Threading::CREATE_NO_WINDOW;

use crate::app_state::AppState;
use crate::err::{ApiError, Result};
use crate::utils::{get_resource_path, now_sec};

pub const EVENT_NAME: &str = "shell_task";

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub struct TaskNotify {
    pub task_id: String,
    pub task_status: TaskStatus,
    pub exit_code: Option<i32>,
    pub message: String,
    pub tm_sec: u64,
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub enum TaskStatus {
    Begin,
    Running,
    End,
    Stdout,
    Stderr,
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, JsonSchema, Clone, Debug)]
pub enum ShellType {
    Cmd,
    Powershell,
    Python,
    YtDlp,
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, JsonSchema, Clone, Debug)]
pub struct ShellJob {
    pub task_id: String,
    pub shell_type: ShellType,
    pub args: Vec<String>,
    pub shell: Option<String>,
    pub working_dir: Option<String>,
    pub encoding: Option<String>,
}

impl ShellJob {
    pub fn make_task(&self) -> Result<ShellTask> {
        let job = self.clone();
        let resource_path = get_resource_path()?;
        // let exe_path = env::current_exe()?;
        // let base_path = exe_path.parent().ok_or(ApiError::Error("err parent".to_string()))?;
        let shell = match &job.shell_type {
            ShellType::YtDlp => {
                let ytdlp_path = resource_path.join("yt-dlp.exe");
                let ytdlp_abs = absolute(ytdlp_path)?;

                match &job.shell {
                    Some(s) => s.clone(),
                    None => ytdlp_abs.to_string_lossy().to_string(),
                }
            }
            ShellType::Python => {
                let python_path = resource_path.join("src-python/.venv/Scripts/python.exe");
                let python_abs = absolute(python_path)?;

                match &job.shell {
                    Some(s) => s.clone(),
                    None => python_abs.to_string_lossy().to_string(),
                }
            }
            ShellType::Cmd => match &job.shell {
                Some(s) => s.clone(),
                None => "cmd".to_string(),
            },
            ShellType::Powershell => match &job.shell {
                Some(s) => s.clone(),
                None => "powershell".to_string(),
            },
        };

        let working_dir = match &job.working_dir {
            Some(s) => s.clone(),
            None => {
                let working_path = resource_path;
                working_path.to_string_lossy().to_string()
            }
        };

        Ok(ShellTask {
            task_id: job.task_id.clone(),
            shell,
            args: job.args.clone(),
            working_dir,
        })
    }
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub struct ShellTask {
    pub task_id: String,
    pub shell: String,
    pub args: Vec<String>,
    pub working_dir: String,
}

impl ShellTask {
    pub async fn run(
        &self,
        state: State<'_, AppState>,
        window: tauri::Window,
    ) -> Result<Option<i32>> {
        println!("run: {:?}", &self);

        let folder = self.working_dir.clone();
        let p_folder = Path::new(&folder);
        if !p_folder.exists() {
            std::fs::create_dir_all(Path::new(&folder))?;
        }

        let child = Command::new(self.shell.clone())
            .args(self.args.clone())
            .current_dir(self.working_dir.clone())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(CREATE_NO_WINDOW.0)
            .spawn()?;
        let child_arc = Arc::new(RwLock::new(child));

        let shell_handles = Arc::clone(&state.shell_handles);
        shell_handles
            .write()
            .await
            .insert(self.task_id.clone(), child_arc.clone());

        window.emit(
            EVENT_NAME,
            TaskNotify {
                task_id: self.task_id.clone(),
                task_status: TaskStatus::Running,
                exit_code: None,
                message: "".to_string(),
                tm_sec: now_sec(),
            },
        )?;
        let (stdout, stderr) = {
            let mut child = child_arc.write().await;
            let stdout = child
                .stdout
                .take()
                .ok_or_else(|| ApiError::Error("Failed to capture stdout".into()))?;
            let stderr = child
                .stderr
                .take()
                .ok_or_else(|| ApiError::Error("Failed to capture stderr".into()))?;
            (stdout, stderr)
        };

        let stdout_task = get_stdout(
            stdout,
            TaskStatus::Stdout,
            self.task_id.clone(),
            window.clone(),
        );
        let stderr_task = get_stdout(
            stderr,
            TaskStatus::Stderr,
            self.task_id.clone(),
            window.clone(),
        );
        let _ = tokio::join!(stdout_task, stderr_task);
        let status = {
            let mut child = child_arc.write().await;
            child.wait().await?
        };

        shell_handles.write().await.remove(&self.task_id.clone());
        Ok(status.code())
    }
}

pub async fn stop(state: State<'_, AppState>, task_id: String) -> Result<()> {
    println!("stop before: {:?}", &task_id);
    let mut shell_handles = state.shell_handles.write().await;
    if let Some(child_arc) = shell_handles.remove(&task_id) {
        let mut child = child_arc.write().await;
        child.kill().await?;
    } else {
        println!("shell task {} not found", task_id);
    }
    println!("stop after: {:?}", &task_id);
    Ok(())
}

fn get_stdout<T: AsyncRead + Unpin + Send + 'static>(
    out: T,
    task_status: TaskStatus,
    task_id: String,
    window: tauri::Window,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        let mut reader = BufReader::new(out);
        let mut buffer = Vec::new();
        while let Ok(n) = reader.read_until(b'\n', &mut buffer).await {
            if n == 0 {
                break;
            }

            let decoded = encoding::all::WINDOWS_949
                .decode(&buffer, DecoderTrap::Replace)
                .unwrap_or_else(|err_txt| format!("<decoding error>: {}", err_txt));
            println!("{}", decoded.clone().trim());
            tokio::task::yield_now().await;
            std::io::stdout().flush().unwrap();
            if let Err(e) = window.emit(
                EVENT_NAME,
                TaskNotify {
                    task_id: task_id.clone(),
                    task_status: task_status.clone(),
                    exit_code: None,
                    message: decoded.clone().trim().to_string(),
                    tm_sec: now_sec(),
                },
            ) {
                println!("{:?}", e);
            };
            buffer.clear();
        }
        println!("done: {:?}", task_status);
    })
}

pub async fn get_media_info(task: &ShellTask) -> Result<String> {
    let folder = task.working_dir.clone();
    let p_folder = Path::new(&folder);
    if !p_folder.exists() {
        std::fs::create_dir_all(Path::new(&folder))?;
    }

    let output = Command::new(task.shell.clone())
        .args(task.args.clone())
        .current_dir(task.working_dir.clone())
        .creation_flags(CREATE_NO_WINDOW.0)
        .output()
        .await?;
    let stdout = String::from_utf8(output.stdout)?;
    println!("{:?}", stdout);

    Ok(stdout)
}
