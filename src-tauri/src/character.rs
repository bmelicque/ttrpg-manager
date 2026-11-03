use std::{
    fs,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::rules::ItemId;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    pub schema_version: u32,
    pub id: String,

    // Informations générales
    pub name: String,
    pub level: u32,
    pub biography: String,
    pub portrait: Option<String>,
    pub notes: String,

    // Caractéristiques et choix fondamentaux
    pub attributes: Attributes,
    pub species_id: String,
    pub heritage_id: Option<String>,
    pub class_id: String,
    pub subclass_id: Option<String>,

    // Progression du personnage
    pub skills: Vec<SkillSelection>,
    pub feats: Vec<FeatSelection>,
    pub spells: Vec<SpellSelection>,

    // Équipement
    pub inventory: Vec<InventoryEntry>,

    // État courant
    pub state: CharacterState,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attributes {
    pub strength: i32,
    pub dexterity: i32,
    pub constitution: i32,
    pub intelligence: i32,
    pub wisdom: i32,
    pub charisma: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillSelection {
    pub skill_id: String,
    pub proficiency: ProficiencyRank,
}
impl SkillSelection {
    pub fn new(skill_id: String, proficiency: ProficiencyRank) -> Self {
        Self {
            skill_id,
            proficiency,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeatSelection {
    pub feat_id: String,
    pub acquired_at_level: u32,
}
impl FeatSelection {
    pub fn new(feat_id: String, acquired_at_level: u32) -> Self {
        Self {
            feat_id,
            acquired_at_level,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpellSelection {
    pub spell_id: String,
    pub acquired_at_level: u32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProficiencyRank {
    Untrained,
    Trained,
    Expert,
    Master,
    Legendary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InventoryEntry {
    pub id: String,
    pub item_id: ItemId,
    pub quantity: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CharacterState {
    pub current_hp: i32,
    pub current_focus_points: u32,
}

pub fn characters_dir_from_data_dir(data_dir: &Path, campaign_id: &str) -> Result<PathBuf, String> {
    Uuid::parse_str(campaign_id).map_err(|_| "Identifiant de campagne invalide.".to_string())?;

    let campaign_dir = data_dir.join("campaigns").join(campaign_id);

    if !campaign_dir.join("campaign.json").is_file() {
        return Err("Campagne introuvable.".to_string());
    }

    let characters_dir = campaign_dir.join("characters");

    fs::create_dir_all(&characters_dir)
        .map_err(|e| format!("Impossible de créer le dossier des personnages : {e}"))?;

    Ok(characters_dir)
}

fn characters_dir(app: &AppHandle, campaign_id: &str) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible de localiser les données : {e}"))?;

    characters_dir_from_data_dir(&data_dir, campaign_id)
}

fn read_character(path: &Path) -> Result<Character, String> {
    let contents =
        fs::read_to_string(path).map_err(|e| format!("Impossible de lire le personnage : {e}"))?;

    serde_json::from_str(&contents).map_err(|e| format!("Fichier de personnage invalide : {e}"))
}

#[tauri::command]
pub fn list_characters(app: AppHandle, campaign_id: String) -> Result<Vec<Character>, String> {
    let directory = characters_dir(&app, &campaign_id)?;
    let entries =
        fs::read_dir(directory).map_err(|e| format!("Impossible de lire les personnages : {e}"))?;

    let mut characters = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }

        characters.push(read_character(&path)?);
    }

    characters.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(characters)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCharacterRequest {
    pub name: String,
    pub level: u32,
    pub biography: String,

    pub attributes: Attributes,

    pub species_id: String,
    pub heritage_id: Option<String>,
    pub class_id: String,
    pub subclass_id: Option<String>,

    pub skill_ids: Vec<String>,
    pub feat_ids: Vec<String>,

    pub inventory: Vec<InventoryEntry>,
}

pub fn create_character_in_directory(
    data_dir: &Path,
    campaign_id: &str,
    request: CreateCharacterRequest,
) -> Result<Character, String> {
    let name = request.name.trim().to_owned();

    if name.is_empty() {
        return Err("Le nom du personnage est obligatoire.".into());
    }

    if request.level == 0 {
        return Err("Le niveau doit être supérieur à zéro.".into());
    }

    if request.species_id.trim().is_empty() || request.class_id.trim().is_empty() {
        return Err("L'espèce et la classe sont obligatoires.".into());
    }

    let directory = characters_dir_from_data_dir(data_dir, campaign_id)?;
    let id = Uuid::new_v4().to_string();

    let skills = request
        .skill_ids
        .into_iter()
        .map(|skill_id| SkillSelection::new(skill_id, ProficiencyRank::Trained))
        .collect();

    let feats = request
        .feat_ids
        .into_iter()
        .map(|feat_id| FeatSelection::new(feat_id, 1))
        .collect();

    let character = Character {
        schema_version: 1,
        id: id.clone(),
        name,
        level: request.level,
        biography: request.biography,
        portrait: None,
        notes: String::new(),
        attributes: request.attributes,
        species_id: request.species_id,
        heritage_id: request.heritage_id,
        class_id: request.class_id,
        subclass_id: request.subclass_id,
        skills,
        feats,
        spells: Vec::new(),
        inventory: request.inventory,
        state: CharacterState {
            current_hp: 0,
            current_focus_points: 0,
        },
    };

    let json = serde_json::to_string_pretty(&character)
        .map_err(|e| format!("Impossible de préparer le personnage : {e}"))?;

    fs::write(directory.join(format!("{id}.json")), json)
        .map_err(|e| format!("Impossible d'enregistrer le personnage : {e}"))?;

    Ok(character)
}

#[tauri::command]
pub fn create_character(
    app: AppHandle,
    campaign_id: String,
    request: CreateCharacterRequest,
) -> Result<Character, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible de localiser les données : {e}"))?;

    create_character_in_directory(&data_dir, &campaign_id, request)
}

#[tauri::command]
pub fn get_character(
    app: AppHandle,
    campaign_id: String,
    character_id: String,
) -> Result<Character, String> {
    Uuid::parse_str(&character_id)
        .map_err(|_| "Identifiant de personnage invalide.".to_string())?;

    let directory = characters_dir(&app, &campaign_id)?;
    let path = directory.join(format!("{character_id}.json"));

    if !path.is_file() {
        return Err("Personnage introuvable.".to_string());
    }

    let character = read_character(&path)?;

    if character.id != character_id {
        return Err("L'identifiant du personnage ne correspond pas au fichier.".into());
    }

    Ok(character)
}

#[tauri::command]
pub fn update_character(
    app: AppHandle,
    campaign_id: String,
    character: Character,
) -> Result<Character, String> {
    Uuid::parse_str(&character.id)
        .map_err(|_| "Identifiant de personnage invalide.".to_string())?;

    let name = character.name.trim();

    if name.is_empty() {
        return Err("Le nom du personnage est obligatoire.".into());
    }

    if character.level == 0 {
        return Err("Le niveau doit être supérieur à zéro.".into());
    }

    if character.species_id.trim().is_empty() || character.class_id.trim().is_empty() {
        return Err("L'espèce et la classe sont obligatoires.".into());
    }

    let directory = characters_dir(&app, &campaign_id)?;
    let path = directory.join(format!("{}.json", character.id));

    if !path.is_file() {
        return Err("Personnage introuvable.".to_string());
    }

    let existing = read_character(&path)?;

    if existing.id != character.id {
        return Err("L'identifiant du personnage ne correspond pas au fichier.".into());
    }

    let name = name.to_owned();
    let mut character = character;
    character.name = name;

    let json = serde_json::to_string_pretty(&character)
        .map_err(|e| format!("Impossible de préparer le personnage : {e}"))?;

    fs::write(&path, json).map_err(|e| format!("Impossible d'enregistrer le personnage : {e}"))?;

    Ok(character)
}

#[tauri::command]
pub fn delete_character(
    app: AppHandle,
    campaign_id: String,
    character_id: String,
) -> Result<(), String> {
    Uuid::parse_str(&character_id)
        .map_err(|_| "Identifiant de personnage invalide.".to_string())?;

    let directory = characters_dir(&app, &campaign_id)?;
    let path = directory.join(format!("{character_id}.json"));

    if !path.is_file() {
        return Err("Personnage introuvable.".to_string());
    }

    let character = read_character(&path)?;

    if character.id != character_id {
        return Err("L'identifiant du personnage ne correspond pas au fichier.".into());
    }

    fs::remove_file(&path).map_err(|e| format!("Impossible de supprimer le personnage : {e}"))?;

    Ok(())
}
