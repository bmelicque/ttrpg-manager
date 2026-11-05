use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::{SkillId, attributes::AttributeId};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub id: SkillId,
    pub name: String,
    pub attribute: AttributeId,
}

const SKILLS_JSON: &str = include_str!("../../rules/skills.json");

pub fn load_skills() -> Result<Vec<Skill>, String> {
    let skills: Vec<Skill> = serde_json::from_str(SKILLS_JSON)
        .map_err(|err| format!("Catalogue des compétences JSON invalide : {err}"))?;

    let mut ids = HashSet::new();

    for item in &skills {
        if item.id.trim().is_empty() {
            return Err("Une compétence possède un identifiant vide".into());
        }

        if !ids.insert(&item.id) {
            return Err(format!("Identifiant de compétence dupliqué : {}", item.id));
        }
    }

    Ok(skills)
}
