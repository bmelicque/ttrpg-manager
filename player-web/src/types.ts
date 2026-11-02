import { type InventoryEntry } from "../../shared/schemas/inventory";

export interface CharacterDraft {
    name: string;
    biography: string;
    level: 1;
    classId: string | null;
    subclassId: string | null;
    speciesId: string | null;
    heritageId: string | null;
    skillIds: string[];
    skillFeatId: string | null;
    equipment: CharacterEquipment;
}

type CharacterEquipment = {
    inventory: InventoryEntry[];
};
