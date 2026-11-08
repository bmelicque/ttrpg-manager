import { API_URL } from "../../../shared/api/rules";
import {
    calculatedCharacterSchema,
    characterSummarySchema,
} from "../../../shared/schemas/character";
import type { InventoryEntry } from "../../../shared/schemas/inventory";
import { getCampaignId } from "../lib/campaign";
import type { CharacterDraft } from "../types";
import { z } from "zod";

type Attributes = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
};

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

function draftToRequest(
    draft: CharacterDraft,
    attributes: Attributes,
): CreateCharacterRequest {
    if (!draft.speciesId) throw new Error("Species ID is required");
    if (!draft.classId) throw new Error("Class ID is required");

    const featIds: string[] = [];

    if (draft.skillFeatId) {
        featIds.push(draft.skillFeatId);
    }

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

async function handleResponse<T extends z.ZodType>(
    response: Response,
    schema: T,
): Promise<z.infer<T>> {
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur HTTP ${response.status}`);
    }

    return response.json().then((r) => schema.parse(r));
}

function campaignCharactersUrl() {
    const campaignId = getCampaignId();
    return `${API_URL}/api/campaigns/${campaignId}/characters`;
}

export async function listCampaignCharacters() {
    const response = await fetch(campaignCharactersUrl());

    return handleResponse(response, z.array(characterSummarySchema));
}

export async function getCampaignCharacter(characterId: string) {
    const response = await fetch(`${campaignCharactersUrl()}/${characterId}`);

    return handleResponse(response, calculatedCharacterSchema);
}

export async function postCharacter(
    draft: CharacterDraft,
    attributes: Attributes,
) {
    return await fetch(campaignCharactersUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(draftToRequest(draft, attributes)),
    });
}
