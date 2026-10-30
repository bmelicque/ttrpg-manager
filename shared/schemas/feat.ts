import z from "zod";

export const featKindSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("general"),
    }),
    z.object({
        type: z.literal("skill"),
    }),
    z.object({
        type: z.literal("class"),
        id: z.string(),
    }),
    z.object({
        type: z.literal("classFeature"),
        id: z.string(),
    }),
    z.object({
        type: z.literal("speciesFeature"),
        id: z.string(),
    }),
]);

export const featSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    kind: featKindSchema,
    prerequisites: z.array(z.string()).default([]),
});

export type Feat = z.infer<typeof featSchema>;
export type FeatKind = z.infer<typeof featKindSchema>;
