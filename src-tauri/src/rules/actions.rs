use std::collections::HashSet;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Action {
    pub id: String,
    pub category: ActionCategory,
    pub name: String,
    pub range: Option<u8>,
    pub area: Option<Area>,
    pub description: String,
    #[serde(default)]
    pub cost: ActionCost,
    #[serde(default)]
    pub traits: Vec<String>,
    #[serde(default)]
    pub kind: ActionKind,
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionCategory {
    #[default]
    Other,
    Strike,

    Composition,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Area {
    Emanation { radius: u8 },
}

#[derive(Debug, Default, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionCost {
    #[default]
    Free,
    One,
    FullTurn,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ActionKind {
    #[default]
    Simple,
    Strike {
        #[serde(default)]
        requirements: Vec<StrikeRequirement>,
        #[serde(default)]
        effects: Vec<StrikeEffect>,
    },
    SkillCheck {
        skill_id: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum StrikeRequirement {
    Finesse,
    Type, // { strike_type: StrikeType },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum StrikeEffect {
    ExtraDice { count: u8 },
    OnFailure { effects: Vec<StrikeEffect> },
}

const ACTIONS_JSON: &str = include_str!("../../rules/actions.json");

pub fn load_actions() -> Result<Vec<Action>, String> {
    let species: Vec<Action> = serde_json::from_str(ACTIONS_JSON)
        .map_err(|err| format!("Catalogue des actions JSON invalide : {err}"))?;

    let mut ids = HashSet::new();

    for item in &species {
        if item.id.trim().is_empty() {
            return Err("Une action possède un identifiant vide".into());
        }

        if !ids.insert(&item.id) {
            return Err(format!("Identifiant d'action dupliqué : {}", item.id));
        }
    }

    Ok(species)
}
