import { createContext } from "preact";
import type { CharacterDraft } from "../types";
import { useContext, useReducer } from "preact/hooks";
import type { PropsWithChildren } from "preact/compat";
import type { Class } from "../../../shared/schemas/class";
import type { Species } from "../../../shared/schemas/species";

export const initialDraft: CharacterDraft = {
    name: "",
    level: 1,
    classId: null,
    subclassId: null,
    speciesId: null,
    heritageId: null,
    attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
    },
    skillIds: [],
    skillFeatId: null,
    equipmentIds: [],
};

export type AttributeId = keyof CharacterDraft["attributes"];

export type DraftAction =
    | { type: "reset" }
    | { type: "set-name"; name: string }
    | { type: "select-class"; classId: string }
    | { type: "select-subclass"; subclassId: string | null }
    | { type: "select-species"; speciesId: string }
    | { type: "select-heritage"; heritageId: string | null }
    | {
          type: "set-attribute";
          attribute: AttributeId;
          value: number;
      }
    | { type: "toggle-skill"; skillId: string }
    | { type: "select-skill-feat"; skillFeatId: string | null }
    | { type: "toggle-equipment"; equipmentId: string };

export function characterDraftReducer(
    draft: CharacterDraft,
    action: DraftAction,
): CharacterDraft {
    switch (action.type) {
        case "reset":
            return initialDraft;

        case "set-name":
            return {
                ...draft,
                name: action.name,
            };

        case "select-class":
            if (draft.classId === action.classId) {
                return draft;
            }

            return {
                ...draft,
                classId: action.classId,
                subclassId: null,
            };

        case "select-subclass":
            return {
                ...draft,
                subclassId: action.subclassId,
            };

        case "select-species":
            if (draft.speciesId === action.speciesId) {
                return draft;
            }

            return {
                ...draft,
                speciesId: action.speciesId,
                heritageId: null,
            };

        case "select-heritage":
            return {
                ...draft,
                heritageId: action.heritageId,
            };

        case "set-attribute":
            return {
                ...draft,
                attributes: {
                    ...draft.attributes,
                    [action.attribute]: action.value,
                },
            };

        case "toggle-skill": {
            const selected = draft.skillIds.includes(action.skillId);

            return {
                ...draft,
                skillIds: selected
                    ? draft.skillIds.filter((id) => id !== action.skillId)
                    : [...draft.skillIds, action.skillId],
            };
        }

        case "select-skill-feat":
            return {
                ...draft,
                skillFeatId: action.skillFeatId,
            };

        case "toggle-equipment": {
            const selected = draft.equipmentIds.includes(action.equipmentId);

            return {
                ...draft,
                equipmentIds: selected
                    ? draft.equipmentIds.filter(
                          (id) => id !== action.equipmentId,
                      )
                    : [...draft.equipmentIds, action.equipmentId],
            };
        }
    }
}

type DraftContextValue = {
    draft: CharacterDraft;
    dispatch: (action: DraftAction) => void;
};
export const DraftContext = createContext<DraftContextValue | null>(null);

export function CharacterDraftProvider({ children }: PropsWithChildren) {
    const [draft, dispatch] = useReducer(characterDraftReducer, initialDraft);
    return (
        <DraftContext.Provider value={{ draft, dispatch }}>
            {children}
        </DraftContext.Provider>
    );
}

export function useDraft() {
    const context = useContext(DraftContext);

    if (!context) {
        throw new Error(
            "useDraft doit être utilisé dans CharacterDraftProvider",
        );
    }

    return context;
}

export function getSelectedClass(
    draft: CharacterDraft,
    classes: Class[] | null,
) {
    return classes?.find((item) => item.id === draft.classId) ?? null;
}

export function getSelectedSpecies(
    draft: CharacterDraft,
    species: Species[] | null,
) {
    return species?.find((item) => item.id === draft.speciesId) ?? null;
}
