import { z } from "zod";
import {
    armorCategorySchema,
    attributeSchema,
    proficiencySchema,
    weaponCategorySchema,
} from "./common";

export const classSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    role: z.string(),
    hitPointsPerLevel: z.number().int(),
    keyAttributes: z.array(attributeSchema),
    proficiencies: z.object({
        perception: proficiencySchema,
        savingThrows: z.object({
            fortitude: proficiencySchema,
            reflex: proficiencySchema,
            will: proficiencySchema,
        }),
        weapons: z.array(
            z.object({ id: weaponCategorySchema, rank: proficiencySchema }),
        ),
        armor: z.array(
            z.object({ id: armorCategorySchema, rank: proficiencySchema }),
        ),
        classDc: proficiencySchema,
    }),
    skills: z.object({
        fixed: z.array(z.string()),
        choices: z.object({
            baseCount: z.number().int(),
            abilityModifier: z.literal("intelligence"),
        }),
    }),
    featureIds: z.array(z.string()),
    subclassIds: z.array(z.string()),
    availableFeatIds: z.array(z.string()),
    // equipmentSuggestions: [],
    quickBuild: z.string().default(""),
});

export type Class = z.infer<typeof classSchema>;
