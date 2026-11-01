import z from "zod";

export const kitItemSchema = z.object({
    itemId: z.string(),
    quantity: z.number().int().positive(),
});

export const equipmentKitSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    items: z.array(kitItemSchema),
});

export type EquipmentKit = z.infer<typeof equipmentKitSchema>;
export type KitItem = z.infer<typeof kitItemSchema>;
