mod common;
mod proficiencies;
mod strikes;

use crate::{
    character::{
        Character, calculated::CalculatedCharacter,
        calculations::proficiencies::calculate_proficiencies,
    },
    rules::{Rules, attributes::Attributes},
};

pub fn calculate_character(character: &Character, rules: &Rules) -> CalculatedCharacter {
    let name = character.name.clone();
    let attributes = calculate_attributes(character, rules);
    let proficiencies = calculate_proficiencies(character, rules);

    let strikes = strikes::calculate_strikes(character, rules, &attributes);
    let actions = strikes.into_iter().map(Into::into).collect();

    CalculatedCharacter {
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
