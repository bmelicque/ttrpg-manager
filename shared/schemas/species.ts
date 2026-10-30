import { z } from "zod";

export const speciesSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    hp: z.number().int(),
    size: z.enum(["tiny", "small", "medium", "large"]),
    speeds: z.object({
        land: z.number().int(),
        swim: z.number().int().optional(),
        fly: z.number().int().optional(),
    }),
    skills: z.array(z.string()).max(2),
    attributes: z.object({
        free: z.number().int(),
        fixed: z.array(z.string()).optional(),
        flaws: z.array(z.string()).optional(),
    }),
    heritageIds: z.array(z.string()),
    // TODO: weapon familiarities
    // TODO: low-light or dark vision, special abilities
    featureIds: z.array(z.string()).default([]),
});

export type Species = z.infer<typeof speciesSchema>;
