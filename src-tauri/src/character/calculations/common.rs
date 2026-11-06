use crate::{
    character::Character,
    rules::{Rules, classes::ClassDefinition, feats::FeatDefinition, species::SpeciesDefinition},
};

pub fn get_class<'rules>(character: &Character, rules: &'rules Rules) -> &'rules ClassDefinition {
    rules
        .classes
        .iter()
        .find(|c| c.id == character.class_id)
        .unwrap()
}

pub fn get_species<'rules>(
    character: &Character,
    rules: &'rules Rules,
) -> &'rules SpeciesDefinition {
    rules
        .species
        .iter()
        .find(|s| s.id == character.species_id)
        .unwrap()
}

pub fn get_features<'rules>(
    character: &Character,
    rules: &'rules Rules,
) -> Vec<&'rules FeatDefinition> {
    let mut feature_ids = get_class(character, rules).feature_ids.clone();
    feature_ids.extend(character.feats.iter().map(|f| f.feat_id.clone()));

    feature_ids
        .into_iter()
        .filter_map(|id| rules.feats.iter().find(|f| f.id == *id))
        .collect()
}
