use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::rules::ItemId;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EquipmentKit {
    pub id: String,
    pub name: String,
    pub description: String,
    pub items: Vec<KitItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KitItem {
    pub item_id: ItemId,
    pub quantity: u32,
}

const KITS_JSON: &str = include_str!("../../../rules/equipment/kits.json");

pub fn load_kits() -> Result<Vec<EquipmentKit>, String> {
    let kits: Vec<EquipmentKit> = serde_json::from_str(KITS_JSON)
        .map_err(|error| format!("Catalogue des kits JSON invalide : {error}"))?;

    let mut ids = HashSet::with_capacity(kits.len());

    for kit in &kits {
        if !ids.insert(kit.id.as_str()) {
            return Err(format!("Identifiant de kit dupliqué : '{}'", kit.id));
        }

        let mut item_ids = HashSet::new();

        for item in &kit.items {
            if item.quantity == 0 {
                return Err(format!(
                    "Quantité invalide pour l'objet '{}' dans le kit '{}'",
                    item.item_id, kit.id
                ));
            }

            if !item_ids.insert(item.item_id.as_str()) {
                return Err(format!(
                    "Objet '{}' présent plusieurs fois dans le kit '{}'",
                    item.item_id, kit.id
                ));
            }
        }
    }

    Ok(kits)
}
