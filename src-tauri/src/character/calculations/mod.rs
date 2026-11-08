mod actions;
mod common;
mod proficiencies;
mod strikes;

use crate::{
    character::{
        Character,
        calculated::CalculatedCharacter,
        calculations::{actions::calculate_actions, proficiencies::calculate_proficiencies},
    },
    rules::{Rules, attributes::Attributes},
};

pub use self::common::{get_class, get_species};

pub fn calculate_character(character: &Character, rules: &Rules) -> CalculatedCharacter {
    let name = character.name.clone();

    let attributes = calculate_attributes(character, rules);
    let proficiencies = calculate_proficiencies(character, rules);

    let actions = calculate_actions(character, rules, &attributes);

    CalculatedCharacter {
        id: character.id.clone(),
        name,
        attributes,
        proficiencies,
        actions,
    }
}

fn calculate_attributes(character: &Character, rules: &Rules) -> Attributes {
    rules
        .classes
        .iter()
        .find(|c| c.id == character.class_id)
        .unwrap()
        .attributes
}
