use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::ItemId;

/// Définition d'un objet disponible dans le catalogue.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemDefinition {
    pub id: ItemId,
    pub name: String,
    pub description: String,

    pub price: u32,

    pub kind: ItemKind,
}

/// Nature de l'objet et propriétés spécifiques à cette catégorie.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum ItemKind {
    Weapon {
        /// Identifiant de catégorie utilisé pour les maîtrises.
        category_id: String,

        /// Nombre de mains nécessaires pour utiliser l'arme.
        hands_required: u8,

        /// Expression des dégâts, selon les conventions du système.
        damage: String,
    },
    Armor {
        /// Identifiant de catégorie utilisé pour les maîtrises.
        category_id: String,

        ac_bonus: u8,
        dex_cap: u8,
        str_req: u8,
        check_penalty: i8,
    },
    Consumable,
    Gear,
}

const ITEMS_JSON: &str = include_str!("../../../rules/equipment/items.json");

pub fn load_items() -> Result<Vec<ItemDefinition>, String> {
    let items: Vec<ItemDefinition> = serde_json::from_str(ITEMS_JSON)
        .map_err(|error| format!("Catalogue d'équipement JSON invalide : {error}"))?;

    let mut ids = HashSet::with_capacity(items.len());

    for item in &items {
        if !ids.insert(item.id.as_str()) {
            return Err(format!("Identifiant d'objet dupliqué : '{}'", item.id));
        }

        if let ItemKind::Weapon { hands_required, .. } = &item.kind {
            if !matches!(hands_required, 1 | 2) {
                return Err(format!(
                    "Nombre de mains invalide pour l'arme '{}' : {}",
                    item.id, hands_required
                ));
            }
        }
    }

    Ok(items)
}
