use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AttributeId {
    Strength,
    Dexterity,
    Constitution,
    Intelligence,
    Wisdom,
    Charisma,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Attributes {
    pub strength: i8,
    pub dexterity: i8,
    pub constitution: i8,
    pub intelligence: i8,
    pub wisdom: i8,
    pub charisma: i8,
}
impl Attributes {
    pub fn get(&self, attribute_id: &AttributeId) -> i8 {
        match attribute_id {
            AttributeId::Strength => self.strength,
            AttributeId::Dexterity => self.dexterity,
            AttributeId::Constitution => self.constitution,
            AttributeId::Intelligence => self.intelligence,
            AttributeId::Wisdom => self.wisdom,
            AttributeId::Charisma => self.charisma,
        }
    }
}
