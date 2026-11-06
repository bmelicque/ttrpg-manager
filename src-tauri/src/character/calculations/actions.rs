use crate::{
    character::{
        Character,
        calculated::CalculatedAction,
        calculations::{common::get_features, strikes},
    },
    rules::{
        Rules,
        actions::{Action, ActionCategory},
        attributes::Attributes,
    },
};

pub fn calculate_actions(
    character: &Character,
    rules: &Rules,
    attributes: &Attributes,
) -> Vec<CalculatedAction> {
    let strikes = strikes::calculate_strikes(character, rules, &attributes);
    let strike_actions = strikes.into_iter().map(Into::into).collect();

    let features = get_features(character, rules);
    let granted_actions = features
        .into_iter()
        .flat_map(|f| &f.effects)
        .filter_map(|e| e.as_grant_action())
        .filter_map(|action| rules.actions.iter().find(|a| a.id == *action))
        .filter_map(|a| calculate_action(a))
        .collect::<Vec<_>>();

    vec![strike_actions, granted_actions].concat()
}

fn calculate_action(action: &Action) -> Option<CalculatedAction> {
    if action.category == ActionCategory::Strike {
        return None;
    }

    Some(CalculatedAction {
        category: action.category,
        name: action.name.clone(),
        cost: action.cost,
        modifier: None,
        description: action.description.clone(),
        range: action.range,
        area: action.area,
    })
}
