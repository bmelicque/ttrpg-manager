import { z } from "zod";

import {
    areaSchema,
    attributeSchema,
    attributesSchema,
    proficiencySchema,
} from "./common";

export const characterSummarySchema = z.object({
    id: z.string(),
    name: z.string(),
    level: z.number().int(),
    portrait: z.string().nullable(),
    speciesName: z.string(),
    className: z.string(),
});

export type CharacterSummary = z.infer<typeof characterSummarySchema>;

// Maîtrise calculée
export const calculatedProficiencySchema = z.object({
    rank: proficiencySchema,
    attributeId: attributeSchema,
    modifier: z.number().int(),
});

// Action calculée
export const calculatedActionSchema = z.object({
    category: z.enum(["other", "strike", "composition"]).default("other"),
    name: z.string(),
    cost: z.enum(["free", "one", "fullTurn"]),
    modifier: z.number().int().nullable(),
    range: z.number().int().min(0).max(255).nullable(),
    area: areaSchema.nullable(),
    description: z.string(),
});

export const calculatedCharacterSchema = z.object({
    id: z.string(),
    name: z.string(),
    attributes: attributesSchema,
    proficiencies: z.object({
        perception: calculatedProficiencySchema,
        saves: z.object({
            fortitude: calculatedProficiencySchema,
            reflexes: calculatedProficiencySchema,
            will: calculatedProficiencySchema,
        }),
        skills: z.record(z.string(), calculatedProficiencySchema),
    }),
    actions: z.array(calculatedActionSchema),
});

export type CalculatedCharacter = z.infer<typeof calculatedCharacterSchema>;
