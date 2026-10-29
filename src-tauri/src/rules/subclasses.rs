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
