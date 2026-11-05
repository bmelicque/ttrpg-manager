use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::{SkillId, attributes::AttributeId, proficiencies::ProficiencyRank};

use super::FeatId;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeatDefinition {
    pub id: FeatId,
    #[serde(default = "default_level")]
    pub level: u8,
    pub name: String,
    pub description: String,
    pub kind: FeatKind,

    #[serde(default)]
    pub prerequisites: Vec<FeatPrerequisite>,
}

fn default_level() -> u8 {
    1
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
        rank: ProficiencyRank,
    },

    Feat {
        feat_id: FeatId,
    },
}

fn default_skill_rank() -> ProficiencyRank {
    ProficiencyRank::Trained
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum FeatEffect {
    GrantAction {
        action_id: String,
    },

    Modifier {
        target: ModifierTarget,
        value: i32,
        condition: Option<String>,
    },

    Proficiency {
        target: ProficiencyTarget,
        rank: ProficiencyRank,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum ModifierTarget {
    Attribute { attribute: AttributeId },
    Skill { skill_id: String },
    Defense { defense: DefenseId },
    Speed,
    HitPoints,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DefenseId {
    ArmorClass,
    Fortitude,
    Reflex,
    Will,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum ProficiencyTarget {
    Skill { skill_id: String },
    WeaponCategory { category_id: String },
    ArmorCategory { category_id: String },
    Perception,
    SavingThrow { defense: DefenseId },
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
