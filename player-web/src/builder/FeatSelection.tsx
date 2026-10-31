import RichText from "../../../shared/components/RichText";
import { useRules } from "../../../shared/contexts/rules";
import type { Class } from "../../../shared/schemas/class";
import {
    meetsPrerequisites,
    type Feat,
    type SkillRank,
} from "../../../shared/schemas/feat";
import { useDraft } from "../contexts/useDraft";
import type { ItemProps } from "./types";

export function ClassFeatSelector({
    selectedClass,
}: {
    selectedClass: Class | null;
}) {
    const {
        feats: { data: feats, loading, error },
    } = useRules();
    const { draft, dispatch } = useDraft();

    if (loading) {
        return <p role="status">Chargement des dons</p>;
    }

    if (error) {
        return (
            <p role="alert">Impossible de charger les dons&nbsp;: {error}</p>
        );
    }

    const availableFeats =
        feats?.filter(
            (item) =>
                item.kind.type === "class" &&
                item.kind.id === selectedClass?.id,
        ) ?? [];

    if (!availableFeats!.length) {
        return <></>;
    }

    return (
        <section class="subclass-selection">
            <h3>Don</h3>
            <p>Choisis un don de {selectedClass!.name}.</p>

            <div class="choice-grid">
                {availableFeats.map((feat) => (
                    <FeatItem
                        key={feat.id}
                        item={feat}
                        isSelected={draft.subclassId === feat.id}
                        select={() =>
                            dispatch({
                                type: "select-subclass",
                                subclassId: feat.id,
                            })
                        }
                    />
                ))}
            </div>
        </section>
    );
}

type SkillFeatSelectorProps = {
    fixedSkills: Set<string>;
    selectedSkills: string[];
};
export function SkillFeatSelector(props: SkillFeatSelectorProps) {
    const { fixedSkills, selectedSkills } = props;
    const {
        feats: { data: feats, loading, error },
    } = useRules();
    const { draft, dispatch } = useDraft();

    if (loading) {
        return <p role="status">Chargement des dons</p>;
    }

    if (error) {
        return (
            <p role="alert">Impossible de charger les dons&nbsp;: {error}</p>
        );
    }

    const skillRanks: Record<string, SkillRank> = Object.fromEntries(
        selectedSkills
            .concat(Array.from(fixedSkills))
            .map((skillId) => [skillId, "trained"]),
    );

    const eligibleSkillFeats = feats?.filter(
        (feat) =>
            feat.kind.type === "skill" &&
            meetsPrerequisites(feat, {
                skillRanks,
                featIds: [],
            }),
    );

    if (!eligibleSkillFeats?.length) {
        return <></>;
    }

    return (
        <section class="subclass-selection">
            <h3>Don de compétence</h3>
            <p>
                Choisis un don. Les dons disponibles dépendent des compétences
                sélectionnées.
            </p>

            <div class="choice-grid">
                {eligibleSkillFeats.map((feat) => (
                    <FeatItem
                        key={feat.id}
                        item={feat}
                        isSelected={draft.subclassId === feat.id}
                        select={() =>
                            dispatch({
                                type: "select-subclass",
                                subclassId: feat.id,
                            })
                        }
                    />
                ))}
            </div>
        </section>
    );
}

function FeatItem(props: Omit<ItemProps<Feat>, "feats">) {
    const { item, isSelected, select } = props;

    return (
        <button
            type="button"
            class={`choice-card ${isSelected ? "selected" : ""}`}
            aria-pressed={isSelected}
            onClick={select}
        >
            <h3>{item.name}</h3>
            <RichText content={item.description} />

            <span class="option-meta">
                {isSelected ? "✓ Sélectionné" : "Choisir"}
            </span>
        </button>
    );
}
