use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::FeatureId;

pub type HeritageId = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeritageDefinition {
    pub id: HeritageId,
    pub name: String,
    pub description: String,

    #[serde(default)]
    pub feature_ids: Vec<FeatureId>,
}

pub fn load_heritages() -> Result<Vec<HeritageDefinition>, String> {
    let raw = include_str!("../../rules/heritages.json");

    let heritages: Vec<HeritageDefinition> = serde_json::from_str(raw)
        .map_err(|err| format!("Catalogue des héritages JSON invalide : {err}"))?;

    let mut ids = HashSet::new();

    for item in &heritages {
        if item.id.trim().is_empty() {
            return Err("Un héritage possède un identifiant vide".into());
        }

        if !ids.insert(&item.id) {
            return Err(format!("Identifiant d'héritage dupliqué : {}", item.id));
        }
    }

    Ok(heritages)
}
