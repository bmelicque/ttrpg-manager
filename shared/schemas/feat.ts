import z from "zod";

export const skillRankSchema = z.enum([
    "trained",
    "expert",
    "master",
    "legendary",
]);

export const featPrerequisiteSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("skill"),
        skillId: z.string(),
        rank: skillRankSchema.default("trained"),
    }),

    z.object({
        type: z.literal("feat"),
        featId: z.string(),
    }),
]);

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
    prerequisites: z.array(featPrerequisiteSchema).default([]),
});

export type Feat = z.infer<typeof featSchema>;
export type FeatKind = z.infer<typeof featKindSchema>;
export type FeatPrerequisite = z.infer<typeof featPrerequisiteSchema>;
export type SkillRank = z.infer<typeof skillRankSchema>;

const rankValues: Record<SkillRank, number> = {
    trained: 1,
    expert: 2,
    master: 3,
    legendary: 4,
};

type PrerequisiteContext = {
    skillRanks: Record<string, SkillRank>;
    featIds: string[];
};

export function meetsPrerequisites(
    feat: Feat,
    context: PrerequisiteContext,
): boolean {
    return feat.prerequisites.every((prerequisite) => {
        switch (prerequisite.type) {
            case "skill": {
                const currentRank = context.skillRanks[prerequisite.skillId];

                if (!currentRank) return false;

                return rankValues[currentRank] >= rankValues[prerequisite.rank];
            }

            case "feat":
                return context.featIds.includes(prerequisite.featId);
        }
    });
}
