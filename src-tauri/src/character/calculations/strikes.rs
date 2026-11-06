use crate::{
    character::{Character, calculated::CalculatedAction, calculations::common::get_class},
    rules::{
        Rules,
        actions::{ActionCategory, ActionCost},
        attributes::Attributes,
        classes::ClassDefinition,
        damage::DamageType,
        equipment::items::{ItemDefinition, ItemKind, WeaponCategory},
        proficiencies::{ProficiencyRank, WeaponProficiency},
    },
};

pub struct Strike {
    pub weapon_name: String,
    pub type_: StrikeType,
    pub modifier: i8,
    pub dice_size: u8,
    pub dice_count: u8,
    pub critical_dice_size: u8,
    pub critical_dice_count: u8,
    pub flat_bonus: i8,
    pub damage_types: Vec<DamageType>,
}
impl Into<CalculatedAction> for Strike {
    fn into(self) -> CalculatedAction {
        let name = format!("Frappe ({})", self.weapon_name);

        let flat_bonus = match self.flat_bonus {
            ..0 => format!("{}", self.flat_bonus),
            0 => "".to_string(),
            1.. => format!("+{}", self.flat_bonus),
        };

        let damage_types = self
            .damage_types
            .into_iter()
            .map(|dt| dt.display())
            .collect::<Vec<_>>()
            .join(" ou ");
        let description = format!(
            "**Réussite critique** Infligez {}d{}{} dégâts {} à la cible.\n\n**Réussite** Infligez {}d{}{} dégâts {} à la cible.",
            self.critical_dice_count,
            self.critical_dice_size,
            flat_bonus,
            &damage_types,
            self.dice_count,
            self.dice_size,
            flat_bonus,
            &damage_types
        );

        CalculatedAction {
            category: ActionCategory::Strike,
            name,
            cost: ActionCost::One,
            modifier: Some(self.modifier),
            range: self.type_.range(),
            area: None,
            description,
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum StrikeType {
    Melee,
    Ranged { range: u8 },
}
impl StrikeType {
    fn range(&self) -> Option<u8> {
        match self {
            StrikeType::Melee => None,
            StrikeType::Ranged { range } => Some(*range),
        }
    }
}

#[derive(Debug, Clone, Copy)]
enum StrikeKind {
    Melee,
    TwoHanded,
    Ranged,
    Thrown,
}

struct WeaponProficiencies {
    simple: ProficiencyRank,
    martial: ProficiencyRank,
    exotic: ProficiencyRank,
    unarmed: ProficiencyRank,
}

const STRIKE_KINDS: [StrikeKind; 4] = [
    StrikeKind::Melee,
    StrikeKind::TwoHanded,
    StrikeKind::Ranged,
    StrikeKind::Thrown,
];

pub fn calculate_strikes(
    character: &Character,
    rules: &Rules,
    attributes: &Attributes,
) -> Vec<Strike> {
    let weapons = resolve_wielded_weapons(character, rules);
    if hands_count(&weapons) == 0 {
        // TODO: fist
    }

    let proficiencies = calculate_weapon_proficiencies(character, rules);

    weapons
        .into_iter()
        .flat_map(|w| {
            STRIKE_KINDS
                .iter()
                .filter_map(|kind| {
                    calculate_strike(&w, *kind, &proficiencies, attributes, character.level as u8)
                })
                .collect::<Vec<_>>()
        })
        .collect()
}

fn calculate_strike(
    weapon: &ItemDefinition,
    kind: StrikeKind,
    proficiencies: &WeaponProficiencies,
    attributes: &Attributes,
    character_level: u8,
) -> Option<Strike> {
    let ItemKind::Weapon {
        category_id,
        damage_dice_size,
        ref damage_types,
        finesse,
        range,
        thrown,
        two_handed,
        deadly,
        fatal,
        ..
    } = weapon.kind
    else {
        return None;
    };
    let type_ = match kind {
        StrikeKind::Melee | StrikeKind::TwoHanded => StrikeType::Melee,
        StrikeKind::Ranged => StrikeType::Ranged { range: range? },
        StrikeKind::Thrown => StrikeType::Ranged { range: thrown? },
    };

    let proficiency = match category_id {
        WeaponCategory::Simple => &proficiencies.simple,
        WeaponCategory::Martial => &proficiencies.martial,
        WeaponCategory::Exotic => &proficiencies.exotic,
        WeaponCategory::Unarmed => &proficiencies.unarmed,
    };
    let attribute = match kind {
        StrikeKind::Ranged | StrikeKind::Thrown => attributes.dexterity,
        _ if finesse => std::cmp::max(attributes.strength, attributes.dexterity),
        _ => attributes.strength,
    };
    let modifier = proficiency.modifier() + attribute + get_potency_bonus(character_level);

    let dice_size = match kind {
        StrikeKind::TwoHanded => two_handed?,
        _ => damage_dice_size,
    };

    let dice_count = match character_level {
        ..=3 => 1,
        4..=11 => 2,
        12..=18 => 3,
        19.. => 4,
    };

    let critical_dice_size = if fatal {
        std::cmp::min(dice_size + 4, 12)
    } else {
        dice_size
    };

    let critical_dice_count = if deadly || fatal {
        2 * dice_count + 1
    } else {
        2 * dice_count
    };

    let flat_bonus = match kind {
        StrikeKind::Melee | StrikeKind::TwoHanded | StrikeKind::Thrown => attributes.strength,
        StrikeKind::Ranged => 0,
    };

    Some(Strike {
        weapon_name: weapon.name.clone(),
        type_,
        modifier,
        dice_size,
        dice_count,
        critical_dice_size,
        critical_dice_count,
        flat_bonus,
        damage_types: damage_types.clone(),
    })
}

fn resolve_wielded_weapons(character: &Character, rules: &Rules) -> Vec<ItemDefinition> {
    character
        .main_hand
        .iter()
        .chain(&character.off_hand)
        .filter_map(|item_id| resolve_item(rules, item_id))
        .collect()
}

fn resolve_item(rules: &Rules, item_id: &str) -> Option<ItemDefinition> {
    rules.items.iter().find(|item| item.id == item_id).cloned()
}

fn hands_count(items: &[ItemDefinition]) -> u8 {
    items.iter().fold(0, |acc, item| acc + item.hands())
}

fn calculate_weapon_proficiencies(character: &Character, rules: &Rules) -> WeaponProficiencies {
    let class = get_class(character, rules);
    WeaponProficiencies {
        simple: get_weapon_proficiency(class, WeaponProficiency::SimpleWeapons),
        martial: get_weapon_proficiency(class, WeaponProficiency::MartialWeapons),
        exotic: get_weapon_proficiency(class, WeaponProficiency::ExoticWeapons),
        unarmed: get_weapon_proficiency(class, WeaponProficiency::UnarmedStrikes),
    }
}
fn get_weapon_proficiency(
    class: &ClassDefinition,
    proficiency: WeaponProficiency,
) -> ProficiencyRank {
    class
        .proficiencies
        .weapons
        .iter()
        .find(|p| p.id == proficiency)
        .map_or(ProficiencyRank::Untrained, |p| p.rank)
}

fn get_potency_bonus(character_level: u8) -> i8 {
    match character_level {
        0..2 => 0,
        2..10 => 1,
        10..16 => 2,
        16.. => 3,
    }
}
