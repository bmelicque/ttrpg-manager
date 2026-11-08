use std::collections::HashMap;

use crate::{
    character::{
        Character,
        calculated::{CalculatedProficiencies, CalculatedProficiency, CalculatedSaves},
        calculations::common::{get_class, get_species},
    },
    rules::{
        Rules, SkillId,
        attributes::{AttributeId, Attributes},
        classes::ClassProficiencies,
        proficiencies::ProficiencyRank,
    },
};

pub fn calculate_proficiencies(character: &Character, rules: &Rules) -> CalculatedProficiencies {
    let class_proficiencies = &get_class(character, &rules.classes).proficiencies;
    let perception = calculate_proficiency(
        class_proficiencies.perception,
        AttributeId::Wisdom,
        &character.attributes,
    );
    let saves = calculate_save_proficiencies(class_proficiencies, &character.attributes);
    let skills = get_skill_proficiencies(character, rules);

    CalculatedProficiencies {
        perception,
        saves,
        skills,
    }
}

fn calculate_proficiency(
    rank: ProficiencyRank,
    attribute_id: AttributeId,
    attributes: &Attributes,
) -> CalculatedProficiency {
    let attribute_value = attributes.get(&attribute_id);
    CalculatedProficiency {
        rank,
        attribute_id,
        modifier: rank.modifier() + attribute_value,
    }
}

fn calculate_save_proficiencies(
    class_proficiencies: &ClassProficiencies,
    attributes: &Attributes,
) -> CalculatedSaves {
    let fortitude = calculate_proficiency(
        class_proficiencies.saving_throws.fortitude,
        AttributeId::Strength,
        attributes,
    );
    let reflexes = calculate_proficiency(
        class_proficiencies.saving_throws.reflex,
        AttributeId::Dexterity,
        attributes,
    );
    let will = calculate_proficiency(
        class_proficiencies.saving_throws.will,
        AttributeId::Wisdom,
        attributes,
    );
    CalculatedSaves {
        fortitude,
        reflexes,
        will,
    }
}

fn get_skill_proficiencies(
    character: &Character,
    rules: &Rules,
) -> HashMap<SkillId, CalculatedProficiency> {
    let ranks = get_skill_proficiency_ranks(character, rules);
    rules
        .skills
        .iter()
        .map(|skill| {
            let rank = *ranks.get(&skill.id).unwrap_or(&ProficiencyRank::Untrained);
            let calculated = calculate_proficiency(rank, skill.attribute, &character.attributes);
            (skill.id.clone(), calculated)
        })
        .collect()
}

fn get_skill_proficiency_ranks(
    character: &Character,
    rules: &Rules,
) -> HashMap<SkillId, ProficiencyRank> {
    get_class(character, &rules.classes)
        .skills
        .fixed
        .iter()
        .chain(&get_species(character, &rules.species).skills.fixed)
        .map(|skill| (skill.clone(), ProficiencyRank::Trained))
        .chain(
            character
                .skills
                .iter()
                .map(|skill| (skill.skill_id.clone(), skill.proficiency)),
        )
        .collect::<HashMap<SkillId, ProficiencyRank>>()
}
