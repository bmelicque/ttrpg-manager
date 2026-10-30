import * as z from "zod";

export const heritageSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    featureIds: z.array(z.string()).default([]),
});

export type Heritage = z.infer<typeof heritageSchema>;
