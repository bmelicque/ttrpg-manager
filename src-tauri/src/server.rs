use axum::{Json, Router, routing::get};
use serde::Serialize;
use std::net::SocketAddr;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

pub async fn run() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let address: SocketAddr = "0.0.0.0:3001".parse()?;

    let listener = tokio::net::TcpListener::bind(address).await?;

    println!("Serveur joueur disponible sur {}", listener.local_addr()?);

    let app = Router::new().route("/api/health", get(health));

    axum::serve(listener, app).await?;

    Ok(())
}
