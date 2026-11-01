import z from "zod";

export const weaponSchema = z.object({
    type: z.literal("weapon"),
    categoryId: z.string(),
    handsRequired: z.union([z.literal(1), z.literal(2)]),
    damage: z.string(),
});

export const armorSchema = z.object({
    type: z.literal("armor"),
    categoryId: z.string(),
    acBonus: z.number().int().nonnegative(),
    dexCap: z.number().int().nonnegative(),
    strReq: z.number().int().nonnegative(),
    checkPenalty: z.number().int().nonpositive(),
});

export const consumableSchema = z.object({
    type: z.literal("consumable"),
});

export const gearSchema = z.object({
    type: z.literal("gear"),
});

export const itemKindSchema = z.discriminatedUnion("type", [
    weaponSchema,
    armorSchema,
    consumableSchema,
    gearSchema,
]);

export const itemSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number().nonnegative(),
    kind: itemKindSchema,
});

export type Item = z.infer<typeof itemSchema>;
export type ItemKind = z.infer<typeof itemKindSchema>;
