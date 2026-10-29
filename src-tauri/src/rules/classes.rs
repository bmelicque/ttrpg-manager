use serde::{Deserialize, Serialize};

pub type SkillId = String;
pub type FeatureId = String;
pub type SubclassId = String;
pub type FeatId = String;
pub type ItemId = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClassDefinition {
    pub id: String,
    pub name: String,
    pub description: String,

    /// Catégorie descriptive de la classe, conservée pour le frontend.
    pub role: String,

    /// PV accordés par niveau de classe.
    pub hit_points_per_level: u16,

    /// Caractéristiques principales ou recommandées.
    pub key_attributes: Vec<AbilityId>,

    pub proficiencies: ClassProficiencies,

    /// Compétences entraînées à la création.
    pub skills: SkillTraining,

    /// Capacités accordées automatiquement au niveau 1.
    #[serde(default)]
    pub feature_ids: Vec<FeatureId>,

    /// Sous-classes accessibles à cette classe.
    #[serde(default)]
    pub subclass_ids: Vec<SubclassId>,

    /// Dons de classe disponibles au niveau 1.
    #[serde(default)]
    pub available_feat_ids: Vec<FeatId>,

    /// Suggestions facultatives, sans attribution automatique.
    #[serde(default)]
    pub equipment_suggestions: Vec<ItemId>,

    /// Conseils de création rapide en texte libre.
    #[serde(default)]
    pub quick_build: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AbilityId {
    Strength,
    Dexterity,
    Constitution,
    Intelligence,
    Wisdom,
    Charisma,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProficiencyRank {
    Untrained,
    Trained,
    Expert,
    Master,
    Legendary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClassProficiencies {
    pub perception: ProficiencyRank,
    pub saving_throws: SavingThrowProficiencies,

    /// Identifiants des catégories ou groupes d'armes maîtrisés.
    #[serde(default)]
    pub weapons: Vec<RankedProficiency>,

    /// Identifiants des catégories ou groupes d'armures maîtrisés.
    #[serde(default)]
    pub armor: Vec<RankedProficiency>,

    /// Maîtrise du DD de classe, si le concept s'applique.
    #[serde(default)]
    pub class_dc: Option<ProficiencyRank>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavingThrowProficiencies {
    pub fortitude: ProficiencyRank,
    pub reflex: ProficiencyRank,
    pub will: ProficiencyRank,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankedProficiency {
    /// Ex. "simple_weapons", "martial_weapons", "light_armor".
    pub id: String,
    pub rank: ProficiencyRank,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillTraining {
    /// Compétences entraînées imposées par la classe.
    #[serde(default)]
    pub fixed: Vec<SkillId>,

    /// Nombre de compétences supplémentaires à choisir.
    pub choices: SkillChoices,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillChoices {
    pub base_count: u8,
    pub ability_modifier: AbilityId,
}
