use dirs_next;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::collections::HashMap;
use std::env;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
// use serde::{Deserialize, Serialize};
// use serde_with::{serde_as, skip_serializing_none};
// use specta::Type;

use crate::err::{ApiError, Result};

pub fn get_resource_path() -> Result<PathBuf> {
    if tauri::is_dev() {
        let current_path = env::current_dir()?;
        Ok(current_path.join("resources"))
    } else {
        let current_path = env::current_exe()?;
        let base_path = current_path
            .parent()
            .ok_or(ApiError::Error("err parent".to_string()))?;
        Ok(base_path.join("resources"))
    }
}

#[derive(Type, Serialize, Deserialize, Eq, Clone, PartialEq, Hash, Debug)]
pub enum HomeType {
    RootDir,
    HomeDir,
    DownloadDir,
    VideoDir,
    DocumentDir,
    DesktopDir,
    PictureDir,
    AudioDir,
    ConfigDir,
    DataDir,
    DataLocalDir,
    CacheDir,
    FontDir,
    PublicDir,
    ExecutableDir,
    RuntimeDir,
    TemplateDir,
}

pub async fn get_home_dir() -> Result<HashMap<HomeType, String>> {
    Ok([
        (
            HomeType::RootDir,
            Some(std::path::absolute(PathBuf::from("/"))?),
        ),
        (HomeType::HomeDir, dirs_next::home_dir()),
        (HomeType::DownloadDir, dirs_next::download_dir()),
        (HomeType::VideoDir, dirs_next::video_dir()),
        (HomeType::DocumentDir, dirs_next::document_dir()),
        (HomeType::DesktopDir, dirs_next::desktop_dir()),
        (HomeType::PictureDir, dirs_next::picture_dir()),
        (HomeType::AudioDir, dirs_next::audio_dir()),
        (HomeType::ConfigDir, dirs_next::config_dir()),
        (HomeType::DataDir, dirs_next::data_dir()),
        (HomeType::DataLocalDir, dirs_next::data_local_dir()),
        (HomeType::CacheDir, dirs_next::cache_dir()),
        (HomeType::FontDir, dirs_next::font_dir()),
        (HomeType::PublicDir, dirs_next::public_dir()),
        (HomeType::ExecutableDir, dirs_next::executable_dir()),
        (HomeType::RuntimeDir, dirs_next::runtime_dir()),
        (HomeType::TemplateDir, dirs_next::template_dir()),
    ]
    .into_iter()
    .filter_map(|(k, opt)| opt.map(|v| (k, v.to_string_lossy().into_owned())))
    .collect())
}

pub fn now_sec() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
