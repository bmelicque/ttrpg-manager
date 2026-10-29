pub mod classes;

use std::collections::HashSet;

use classes::ClassDefinition;

const CLASSES_JSON: &str = include_str!("../../rules/classes.json");

pub fn load_classes() -> Result<Vec<ClassDefinition>, String> {
    let classes: Vec<ClassDefinition> = serde_json::from_str(CLASSES_JSON)
        .map_err(|error| format!("Catalogue des classes JSON invalide : {error}"))?;

    let mut ids = HashSet::with_capacity(classes.len());

    for class in &classes {
        if !ids.insert(class.id.as_str()) {
            return Err(format!("Identifiant de classe dupliqué : '{}'", class.id));
        }

        validate_unique_ids(
            &class.feature_ids,
            &format!("features de la classe '{}'", class.id),
        )?;

        validate_unique_ids(
            &class.subclass_ids,
            &format!("sous-classes de la classe '{}'", class.id),
        )?;

        validate_unique_ids(
            &class.available_feat_ids,
            &format!("dons de la classe '{}'", class.id),
        )?;
    }

    Ok(classes)
}

fn validate_unique_ids(ids: &[String], context: &str) -> Result<(), String> {
    let mut seen = HashSet::with_capacity(ids.len());

    for id in ids {
        if !seen.insert(id.as_str()) {
            return Err(format!("Identifiant dupliqué '{}' dans {context}", id));
        }
    }

    Ok(())
}
