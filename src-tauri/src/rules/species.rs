use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::{FeatureId, SkillId, attributes::AttributeId};

pub type SpeciesId = String;
pub type HeritageId = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpeciesDefinition {
    pub id: SpeciesId,
    pub name: String,
    pub description: String,
    pub hp: u16,
    pub size: SpeciesSize,
    pub speeds: SpeciesSpeeds,
    pub skills: SpeciesSkills,
    pub attributes: SpeciesAttributes,
    pub heritage_ids: Vec<HeritageId>,

    #[serde(default)]
    pub feature_ids: Vec<FeatureId>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SpeciesSize {
    Tiny,
    Small,
    Medium,
    Large,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpeciesSpeeds {
    pub land: u16,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub swim: Option<u16>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fly: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpeciesSkills {
    pub fixed: Vec<SkillId>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub free: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpeciesAttributes {
    pub free: u8,

    #[serde(default)]
    pub fixed: Vec<AttributeId>,

    #[serde(default)]
    pub flaws: Vec<AttributeId>,
}

pub fn load_species() -> Result<Vec<SpeciesDefinition>, String> {
    let raw = include_str!("../../rules/species.json");

    let species: Vec<SpeciesDefinition> = serde_json::from_str(raw)
        .map_err(|err| format!("Catalogue des espèces JSON invalide : {err}"))?;

    let mut ids = HashSet::new();

    for item in &species {
        if item.id.trim().is_empty() {
            return Err("Une espèce possède un identifiant vide".into());
        }

        if !ids.insert(&item.id) {
            return Err(format!("Identifiant d'espèce dupliqué : {}", item.id));
        }
    }

    Ok(species)
}
