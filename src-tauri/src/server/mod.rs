use axum::{Json, Router, extract::State, http::Method, routing::get};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::rules::classes::ClassDefinition;

const CLASSES_JSON: &str = include_str!("../../rules/classes.json");

#[derive(Clone)]
struct AppState {
    classes: Arc<Vec<ClassDefinition>>,
}

async fn health() -> &'static str {
    r#"{"status":"ok"}"#
}

async fn list_classes(State(state): State<AppState>) -> Json<Vec<ClassDefinition>> {
    Json((*state.classes).clone())
}

pub async fn run() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let classes: Vec<ClassDefinition> = serde_json::from_str(CLASSES_JSON)?;

    let state = AppState {
        classes: Arc::new(classes),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/rules/classes", get(list_classes))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;

    axum::serve(listener, app).await?;

    Ok(())
}
