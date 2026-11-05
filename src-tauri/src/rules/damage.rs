use serde::{Deserialize, Serialize};

pub struct DamageExpression {
    pub components: Vec<DamageComponent>,
}

pub struct DamageComponent {
    pub dice: Option<DamageDice>,
    pub flat_bonus: i32,
    pub damage_type: DamageType,
    pub category: DamageCategory,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct DamageDice {
    pub count: u32,
    pub die_size: u32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DamageType {
    Bludgeoning,
    Piercing,
    Slashing,
}
impl DamageType {
    pub fn display(&self) -> String {
        match self {
            DamageType::Bludgeoning => "contondants".to_string(),
            DamageType::Piercing => "perforants".to_string(),
            DamageType::Slashing => "tranchants".to_string(),
        }
    }
}

#[derive(Debug, Default, Clone, Copy, Serialize, Deserialize)]
pub enum DamageCategory {
    #[default]
    Base,
    Persistent,
    Splash,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum DamageModifier {
    AddWeaponDice {
        count: u32,
    },
    AddFlatBonus {
        amount: i32,
    },
    AddDamage {
        dice: DamageDice,
        damage_type: DamageType,
        category: DamageCategory,
    },
}
