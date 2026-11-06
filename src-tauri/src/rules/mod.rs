pub mod actions;
pub mod attributes;
pub mod classes;
pub mod damage;
pub mod equipment;
pub mod feats;
pub mod heritages;
pub mod proficiencies;
pub mod skills;
pub mod species;
pub mod subclasses;
mod utils;

pub type SkillId = String;
pub type FeatureId = String;
pub type SubclassId = String;
pub type FeatId = String;
pub type ItemId = String;

pub struct Rules {
    pub classes: Vec<classes::ClassDefinition>,
    pub species: Vec<species::SpeciesDefinition>,
    pub skills: Vec<skills::Skill>,
    pub feats: Vec<feats::FeatDefinition>,
    pub items: Vec<equipment::items::ItemDefinition>,
    pub actions: Vec<actions::Action>,
}
