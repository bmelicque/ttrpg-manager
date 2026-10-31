use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::SkillId;

use super::FeatId;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeatDefinition {
    pub id: FeatId,
    pub name: String,
    pub description: String,
    pub kind: FeatKind,

    #[serde(default)]
    pub prerequisites: Vec<FeatPrerequisite>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "id", rename_all = "camelCase")]
pub enum FeatKind {
    General,
    Skill,
    Class(String),
    ClassFeature(String),
    SpeciesFeature(String),
    HeritageFeature(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum FeatPrerequisite {
    Skill {
        skill_id: SkillId,

        #[serde(default = "default_skill_rank")]
        rank: SkillRank,
    },

    Feat {
        feat_id: FeatId,
    },
}

fn default_skill_rank() -> SkillRank {
    SkillRank::Trained
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SkillRank {
    Trained,
    Expert,
    Master,
    Legendary,
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
    }

    Ok(feats)
}
