import { type InventoryEntry } from "../../shared/schemas/inventory";

export interface CharacterDraft {
    name: string;
    level: 1;
    classId: string | null;
    subclassId: string | null;
    speciesId: string | null;
    heritageId: string | null;
    attributes: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };
    skillIds: string[];
    skillFeatId: string | null;
    equipment: CharacterEquipment;
}

type CharacterEquipment = {
    inventory: InventoryEntry[];
};
