use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub description: String,
    pub system: String,
    pub created_at: u64,
}

fn campaigns_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not locate application data: {e}"))?;

    path.push("campaigns");

    fs::create_dir_all(&path).map_err(|e| format!("Could not create campaigns directory: {e}"))?;

    Ok(path)
}

#[tauri::command]
pub fn list_campaigns(app: AppHandle) -> Result<Vec<Campaign>, String> {
    let directory = campaigns_dir(&app)?;
    let mut campaigns = Vec::new();

    let entries = fs::read_dir(directory).map_err(|e| format!("Could not read campaigns: {e}"))?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path().join("campaign.json");

        if !path.is_file() {
            continue;
        }

        let contents = fs::read_to_string(&path)
            .map_err(|e| format!("Could not read {}: {e}", path.display()))?;

        let campaign: Campaign = serde_json::from_str(&contents)
            .map_err(|e| format!("Invalid campaign file {}: {e}", path.display()))?;

        campaigns.push(campaign);
    }

    campaigns.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(campaigns)
}

#[tauri::command]
pub fn create_campaign(
    app: AppHandle,
    name: String,
    description: String,
    system: String,
) -> Result<Campaign, String> {
    let name = name.trim().to_owned();

    if name.is_empty() {
        return Err("Campaign name cannot be empty.".into());
    }

    let created_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();

    let campaign = Campaign {
        id: Uuid::new_v4().to_string(),
        name,
        description: description.trim().to_owned(),
        system: system.trim().to_owned(),
        created_at,
    };

    let directory = campaigns_dir(&app)?.join(&campaign.id);

    fs::create_dir(&directory).map_err(|e| format!("Could not create campaign directory: {e}"))?;

    // Prepare the basic structure for future campaign content.
    for subdirectory in ["characters", "maps", "assets"] {
        fs::create_dir(directory.join(subdirectory))
            .map_err(|e| format!("Could not create {subdirectory} directory: {e}"))?;
    }

    let json = serde_json::to_string_pretty(&campaign)
        .map_err(|e| format!("Could not serialize campaign: {e}"))?;

    fs::write(directory.join("campaign.json"), json)
        .map_err(|e| format!("Could not save campaign: {e}"))?;

    Ok(campaign)
}

fn read_campaign(path: &std::path::Path) -> Result<Campaign, String> {
    let contents = std::fs::read_to_string(path)
        .map_err(|error| format!("Could not read campaign: {error}"))?;

    serde_json::from_str(&contents)
        .map_err(|error| format!("Could not parse campaign JSON: {error}"))
}

#[tauri::command]
pub fn get_campaign(app: AppHandle, id: String) -> Result<Campaign, String> {
    // Campaign IDs are UUIDs, so reject arbitrary path input.
    Uuid::parse_str(&id).map_err(|_| "Invalid campaign ID.".to_string())?;

    let path = campaigns_dir(&app)?.join(&id).join("campaign.json");

    if !path.is_file() {
        return Err("Campaign not found.".to_string());
    }

    read_campaign(&path)
}
