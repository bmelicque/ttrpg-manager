use crate::{
    character::Character,
    rules::{Rules, classes::ClassDefinition, species::SpeciesDefinition},
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
