use std::collections::HashSet;

pub fn validate_unique_ids(ids: &[String], context: &str) -> Result<(), String> {
    let mut seen = HashSet::with_capacity(ids.len());

    for id in ids {
        if !seen.insert(id.as_str()) {
            return Err(format!("Identifiant dupliqué '{}' dans {context}", id));
        }
    }

    Ok(())
}
