import z from "zod";

export const inventoryEntrySchema = z.object({
    id: z.string(),
    itemId: z.string(),
    quantity: z.number().int().positive(),
});

export type InventoryEntry = z.infer<typeof inventoryEntrySchema>;
