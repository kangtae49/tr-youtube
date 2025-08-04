use std::collections::HashMap;
use std::sync::Arc;
use tokio::process::Child;
use tokio::sync::RwLock;

pub struct AppState {
    pub shell_handles: Arc<RwLock<HashMap<String, Arc<RwLock<Child>>>>>,
}
