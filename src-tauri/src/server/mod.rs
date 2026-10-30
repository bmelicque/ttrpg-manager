use axum::{Json, Router, extract::State, http::Method, routing::get};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::rules::{
    classes::{ClassDefinition, load_classes},
    feats::{FeatDefinition, load_feats},
    heritages::{HeritageDefinition, load_heritages},
    species::{SpeciesDefinition, load_species},
    subclasses::{SubclassDefinition, load_subclasses},
};

#[derive(Clone)]
struct AppState {
    classes: Arc<Vec<ClassDefinition>>,
    subclasses: Arc<Vec<SubclassDefinition>>,
    feats: Arc<Vec<FeatDefinition>>,
    species: Arc<Vec<SpeciesDefinition>>,
    heritages: Arc<Vec<HeritageDefinition>>,
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

pub async fn run() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let state = AppState {
        classes: Arc::new(load_classes()?),
        subclasses: Arc::new(load_subclasses()?),
        feats: Arc::new(load_feats()?),
        species: Arc::new(load_species()?),
        heritages: Arc::new(load_heritages()?),
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
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;

    axum::serve(listener, app).await?;

    Ok(())
}
