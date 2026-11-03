import { API_URL } from "../../../shared/api/rules";
import type { InventoryEntry } from "../../../shared/schemas/inventory";
import { getCampaignId } from "../lib/campaign";
import type { CharacterDraft } from "../types";

type CreateCharacterRequest = {
    name: string;
    level: number;
    biography: string;

    attributes: Attributes;

    speciesId: string;
    heritageId: string | null;
    classId: string;
    subclassId: string | null;

    skillIds: string[];
    featIds: string[];

    inventory: InventoryEntry[];
};

type Attributes = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
};

function draftToRequest(
    draft: CharacterDraft,
    attributes: Attributes,
): CreateCharacterRequest {
    if (!draft.speciesId) throw new Error("Species ID is required");
    if (!draft.classId) throw new Error("Class ID is required");
    const featIds = [];
    if (draft.skillFeatId) featIds.push(draft.skillFeatId);
    return {
        name: draft.name,
        level: draft.level,
        biography: draft.biography,
        attributes,
        speciesId: draft.speciesId,
        heritageId: draft.heritageId,
        classId: draft.classId,
        subclassId: draft.subclassId,
        skillIds: draft.skillIds,
        featIds,
        inventory: draft.equipment.inventory,
    };
}

export function postCharacter(draft: CharacterDraft, attributes: Attributes) {
    const campaignId = getCampaignId();
    return fetch(`${API_URL}/api/campaigns/${campaignId}/characters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(draftToRequest(draft, attributes)),
    });
}
