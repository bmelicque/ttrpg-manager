use axum::{
    Json, Router,
    extract::{Path, State},
    http::{Method, StatusCode},
    routing::{get, post},
};
use std::{path::PathBuf, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

use crate::{
    character::{
        Character, CreateCharacterRequest, calculated::CalculatedCharacter,
        calculations::calculate_character, create_character_in_directory,
        get_character_from_directory,
    },
    rules::{
        Rules,
        classes::{ClassDefinition, load_classes},
        equipment::{
            items::{ItemDefinition, load_items},
            kits::{EquipmentKit, load_kits},
        },
        feats::{FeatDefinition, load_feats},
        heritages::{HeritageDefinition, load_heritages},
        skills::{Skill, load_skills},
        species::{SpeciesDefinition, load_species},
        subclasses::{SubclassDefinition, load_subclasses},
    },
};

#[derive(Clone)]
struct AppState {
    classes: Arc<Vec<ClassDefinition>>,
    subclasses: Arc<Vec<SubclassDefinition>>,
    feats: Arc<Vec<FeatDefinition>>,
    species: Arc<Vec<SpeciesDefinition>>,
    heritages: Arc<Vec<HeritageDefinition>>,
    items: Arc<Vec<ItemDefinition>>,
    equipment_kits: Arc<Vec<EquipmentKit>>,
    skills: Arc<Vec<Skill>>,

    data_dir: PathBuf,
}
impl Into<Rules> for &AppState {
    fn into(self) -> Rules {
        Rules {
            classes: self.classes.to_vec(),
            species: self.species.to_vec(),
            skills: self.skills.to_vec(),
            items: self.items.to_vec(),
        }
    }
}

async fn health() -> &'static str {
    r#"{"status":"ok"}"#
}

async fn list_classes(State(state): State<AppState>) -> Json<Vec<ClassDefinition>> {
    Json((*state.classes).clone())
}

async fn list_subclasses(State(state): State<AppState>) -> Json<Vec<SubclassDefinition>> {
    Json((*state.subclasses).clone())
}

async fn list_feats(State(state): State<AppState>) -> Json<Vec<FeatDefinition>> {
    Json((*state.feats).clone())
}

async fn list_species(State(state): State<AppState>) -> Json<Vec<SpeciesDefinition>> {
    Json((*state.species).clone())
}

async fn list_heritages(State(state): State<AppState>) -> Json<Vec<HeritageDefinition>> {
    Json((*state.heritages).clone())
}

async fn list_items(State(state): State<AppState>) -> Json<Vec<ItemDefinition>> {
    Json((*state.items).clone())
}

async fn list_equipment_kits(State(state): State<AppState>) -> Json<Vec<EquipmentKit>> {
    Json((*state.equipment_kits).clone())
}

async fn create_campaign_character(
    State(state): State<AppState>,
    Path(campaign_id): Path<String>,
    Json(request): Json<CreateCharacterRequest>,
) -> Result<Json<Character>, (StatusCode, String)> {
    let character =
        create_character_in_directory(&state.data_dir, &campaign_id, request).map_err(|error| {
            let status = if error == "Campagne introuvable." {
                StatusCode::NOT_FOUND
            } else {
                StatusCode::BAD_REQUEST
            };

            (status, error)
        })?;

    Ok(Json(character))
}

async fn get_campaign_character(
    State(state): State<AppState>,
    Path((campaign_id, character_id)): Path<(String, String)>,
) -> Result<Json<CalculatedCharacter>, (StatusCode, String)> {
    let character = get_character_from_directory(&state.data_dir, &campaign_id, &character_id)
        .map_err(|error| (StatusCode::NOT_FOUND, error))?;
    let character = calculate_character(&character, &(&state).into());

    Ok(Json(character))
}

pub async fn run(data_dir: PathBuf) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let state = AppState {
        classes: Arc::new(load_classes()?),
        subclasses: Arc::new(load_subclasses()?),
        feats: Arc::new(load_feats()?),
        species: Arc::new(load_species()?),
        heritages: Arc::new(load_heritages()?),
        items: Arc::new(load_items()?),
        equipment_kits: Arc::new(load_kits()?),
        skills: Arc::new(load_skills()?),

        data_dir,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/rules/classes", get(list_classes))
        .route("/api/rules/subclasses", get(list_subclasses))
        .route("/api/rules/feats", get(list_feats))
        .route("/api/rules/species", get(list_species))
        .route("/api/rules/heritages", get(list_heritages))
        .route("/api/rules/items", get(list_items))
        .route("/api/rules/equipment-kits", get(list_equipment_kits))
        .route(
            "/api/campaigns/{campaign_id}/characters",
            post(create_campaign_character),
        )
        .route(
            "/api/campaigns/{campaign_id}/characters/{character_id}",
            get(get_campaign_character),
        )
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;

    axum::serve(listener, app).await?;

    Ok(())
}
