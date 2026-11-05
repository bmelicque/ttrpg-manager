use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Action {
    pub id: String,
    pub name: String,
    pub description: String,
    pub cost: ActionCost,
    #[serde(default)]
    pub traits: Vec<String>,
    pub kind: ActionKind,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ActionCost {
    Free,
    One,
    FullTurn,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ActionKind {
    Strike {
        #[serde(default)]
        requirements: Vec<StrikeRequirement>,
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
