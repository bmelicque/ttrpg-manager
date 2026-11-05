use serde::{Deserialize, Serialize};

use crate::rules::equipment::items::WeaponCategory;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProficiencyRank {
    Untrained,
    Trained,
    Expert,
    Master,
    Legendary,
}

impl ProficiencyRank {
    pub fn modifier(self) -> i8 {
        match self {
            Self::Untrained => -2,
            Self::Trained => 2,
            Self::Expert => 4,
            Self::Master => 6,
            Self::Legendary => 8,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Proficiency {
    Perception,
    Weapon(WeaponProficiency),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WeaponProficiency {
    SimpleWeapons,
    MartialWeapons,
    ExoticWeapons,
    UnarmedStrikes,
}

impl From<WeaponCategory> for WeaponProficiency {
    fn from(category: WeaponCategory) -> Self {
        match category {
            WeaponCategory::Simple => Self::SimpleWeapons,
            WeaponCategory::Martial => Self::MartialWeapons,
            WeaponCategory::Exotic => Self::ExoticWeapons,
            WeaponCategory::Unarmed => Self::UnarmedStrikes,
        }
    }
}
