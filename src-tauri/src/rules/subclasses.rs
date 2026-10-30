use std::collections::HashSet;

use serde::{Deserialize, Serialize};

pub type FeatureId = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubclassDefinition {
    pub id: String,
    pub class_id: String,
    pub name: String,
    pub description: String,
    pub role: String,

    #[serde(default)]
    pub feature_ids: Vec<FeatureId>,
}

const SUBCLASSES_JSON: &str = include_str!("../../rules/subclasses.json");

pub fn load_subclasses() -> Result<Vec<SubclassDefinition>, String> {
    let subclasses: Vec<SubclassDefinition> = serde_json::from_str(SUBCLASSES_JSON)
        .map_err(|error| format!("Catalogue des sous-classes JSON invalide : {error}"))?;

    let mut ids = HashSet::with_capacity(subclasses.len());

    for subclass in &subclasses {
        if !ids.insert(subclass.id.as_str()) {
            return Err(format!(
                "Identifiant de sous-classe dupliqué : '{}'",
                subclass.id
            ));
        }

        if subclass.id.is_empty() || subclass.class_id.is_empty() {
            return Err(format!(
                "La sous-classe '{}' doit avoir un identifiant et un classId non vides",
                subclass.id
            ));
        }
    }

    Ok(subclasses)
}
