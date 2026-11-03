import { useRules } from "../../../shared/contexts/rules";
import {
    getSelectedClass,
    getSelectedSpecies,
    useDraft,
    type AttributeId,
} from "../contexts/useDraft";
import { SkillFeatSelector } from "./FeatSelection";
import { useAttributes } from "./useAttributes";

export type SkillOption = {
    id: string;
    name: string;
    attribute: AttributeId;
};

export const skills = [
    { id: "acrobatics", name: "Acrobaties", attribute: "dexterity" },
    { id: "arcana", name: "Arcanes", attribute: "intelligence" },
    { id: "athletics", name: "Athlétisme", attribute: "strength" },
    { id: "crafting", name: "Artisanat", attribute: "intelligence" },
    { id: "deception", name: "Duperie", attribute: "charisma" },
    { id: "diplomacy", name: "Diplomatie", attribute: "charisma" },
    { id: "intimidation", name: "Intimidation", attribute: "charisma" },
    { id: "medicine", name: "Médicine", attribute: "wisdom" },
    { id: "nature", name: "Nature", attribute: "wisdom" },
    { id: "occultism", name: "Occultisme", attribute: "intelligence" },
    { id: "performance", name: "Représentation", attribute: "charisma" },
    { id: "religion", name: "Religion", attribute: "wisdom" },
    { id: "society", name: "Société", attribute: "intelligence" },
    { id: "stealth", name: "Discrétion", attribute: "dexterity" },
    { id: "survival", name: "Survie", attribute: "wisdom" },
    { id: "thievery", name: "Larcin", attribute: "dexterity" },
].sort((a, b) => a.name.localeCompare(b.name)) as SkillOption[];

export default function SkillSelection() {
    const { draft } = useDraft();
    const { skills: fixedSkills, free } = useComputedSkills();

    const selectedSkills = draft.skillIds;

    const remaining = free - selectedSkills.length;

    return (
        <section class="skill-selection">
            <AttributePreview />
            <header class="skill-selection-header">
                <div>
                    <h2>Qualifications</h2>
                    <p>
                        Choisis les compétences dans lesquelles ton personnage
                        est entraîné.
                    </p>
                </div>

                <div class="skill-counter">
                    <strong>{remaining}</strong>
                    <span>choix restants</span>
                </div>
            </header>

            <div class="skill-list">
                {skills.map((skill) => (
                    <SkillButton
                        key={skill.id}
                        skill={skill}
                        selectedSkills={selectedSkills}
                        fixedSkills={fixedSkills}
                        remaining={remaining > 0}
                    />
                ))}
            </div>
            <SkillFeatSelector
                selectedSkills={selectedSkills}
                fixedSkills={fixedSkills}
            />
        </section>
    );
}

function useComputedSkills() {
    const {
        classes: { data: classes },
        species: { data: species },
    } = useRules();
    const { draft } = useDraft();

    const selectedClass = getSelectedClass(draft, classes);
    const selectedSpecies = getSelectedSpecies(draft, species);

    const skillIds = [];
    if (selectedClass) skillIds.push(...selectedClass.skills.fixed);
    if (selectedSpecies) skillIds.push(...selectedSpecies.skills.fixed);
    const skillSet = new Set(skillIds);

    let free = skillIds.length - skillSet.size;
    if (selectedClass) {
        free +=
            selectedClass.skills.choices.baseCount +
            selectedClass.attributes.intelligence;
    }
    if (selectedSpecies) free += selectedSpecies.skills.free ?? 0;

    return { skills: skillSet, free };
}

const attributeNames: Record<AttributeId, string> = {
    strength: "Force",
    dexterity: "Dextérité",
    constitution: "Constitution",
    intelligence: "Intelligence",
    wisdom: "Sagesse",
    charisma: "Charisme",
};

const attributeOrder: AttributeId[] = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
];

function AttributePreview() {
    const attributes = useAttributes();
    if (!attributes) return <></>;
    return (
        <section class="attribute-preview">
            <dl class="attribute-grid">
                {attributeOrder.map((attribute) => (
                    <AttributeBadge
                        id={attribute}
                        value={attributes[attribute]}
                    />
                ))}
            </dl>
            <small>
                Les valeurs ci-dessus ont été déterminées automatiquement à
                partir de votre classe et de votre espèce.
            </small>
        </section>
    );
}

function AttributeBadge({ id, value }: { id: AttributeId; value: number }) {
    return (
        <div key={id}>
            <dt>{attributeNames[id]}</dt>
            <dd>{value > 0 ? `+${value}` : value}</dd>
        </div>
    );
}

type SkillButtonProps = {
    skill: SkillOption;
    selectedSkills: string[];
    fixedSkills: Set<string>;
    remaining: boolean;
};
function SkillButton(props: SkillButtonProps) {
    const { skill, selectedSkills, fixedSkills, remaining } = props;
    const { dispatch } = useDraft();
    const attributes = useAttributes();
    if (!attributes) return <></>;
    const isFixed = fixedSkills.has(skill.id);
    const isSelected = selectedSkills.includes(skill.id);
    const isDisabled = isFixed || (!isSelected && !remaining);

    const className = [
        "skill-option",
        isFixed || isSelected ? "selected" : "",
        isFixed ? "fixed" : "",
    ].join(" ");

    const toggleSkill = () =>
        dispatch({
            type: "toggle-skill",
            skillId: skill.id,
        });

    return (
        <button
            key={skill.id}
            type="button"
            className={className}
            disabled={isDisabled}
            aria-pressed={isFixed || isSelected}
            onClick={toggleSkill}
        >
            <span class="skill-option-indicator">
                {isFixed || isSelected ? "✓" : ""}
            </span>

            <span class="skill-option-info">
                <strong class="skill-option-name">{skill.name}</strong>

                <span class="skill-option-attribute">
                    {attributeNames[skill.attribute]}
                    {!isFixed && (
                        <strong>
                            {attributes[skill.attribute] > 0
                                ? `+${attributes[skill.attribute]}`
                                : attributes[skill.attribute]}
                        </strong>
                    )}
                </span>
            </span>

            {isFixed && <span class="skill-option-badge">Automatique</span>}
        </button>
    );
}
