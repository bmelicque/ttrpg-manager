import z from "zod";

export const subclassSchema = z.object({
    id: z.string(),
    classId: z.string(),
    name: z.string(),
    description: z.string(),
    role: z.string(),
    featureIds: z.array(z.string()),
});

export type Subclass = z.infer<typeof subclassSchema>;
