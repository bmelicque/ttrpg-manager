use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use super::FeatId;
use super::utils::validate_unique_ids;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeatDefinition {
    pub id: FeatId,
    pub name: String,
    pub description: String,
    pub kind: FeatKind,

    #[serde(default)]
    pub prerequisites: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum FeatKind {
    General,
    Skill,
    #[serde(rename_all = "camelCase")]
    ClassFeature {
        class_id: String,
    },
    #[serde(rename_all = "camelCase")]
    ClassFeat {
        class_id: String,
    },
}

const FEATS_JSON: &str = include_str!("../../rules/feats.json");

pub fn load_feats() -> Result<Vec<FeatDefinition>, String> {
    let feats: Vec<FeatDefinition> = serde_json::from_str(FEATS_JSON)
        .map_err(|error| format!("Catalogue des dons JSON invalide : {error}"))?;

    let mut ids = HashSet::with_capacity(feats.len());

    for feat in &feats {
        if !ids.insert(feat.id.as_str()) {
            return Err(format!("Identifiant de don dupliqué : '{}'", feat.id));
        }

        validate_unique_ids(
            &feat.prerequisites,
            &format!("prérequis du don '{}'", feat.id),
        )?;
    }

    Ok(feats)
}
