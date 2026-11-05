use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::{
    character::Attributes,
    rules::{
        SkillId, actions::ActionCost, attributes::AttributeId, proficiencies::ProficiencyRank,
    },
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedCharacter {
    // Identity
    pub name: String,

    pub attributes: Attributes,

    pub proficiencies: CalculatedProficiencies,

    pub actions: Vec<CalculatedAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedProficiencies {
    pub perception: CalculatedProficiency,
    pub saves: CalculatedSaves,
    pub skills: HashMap<SkillId, CalculatedProficiency>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedSaves {
    pub fortitude: CalculatedProficiency,
    pub reflexes: CalculatedProficiency,
    pub will: CalculatedProficiency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedProficiency {
    pub rank: ProficiencyRank,
    pub attribute_id: AttributeId,
    pub modifier: i8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatedAction {
    pub name: String,
    pub action_cost: ActionCost,
    pub modifier: Option<i8>,
    pub range: Option<u8>,
    pub description: String,
}
