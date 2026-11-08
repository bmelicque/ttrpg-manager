import { useState } from "preact/hooks";
import "./character-sheet.css";
import { CalculatedCharacter } from "../../shared/schemas/character";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CalculatedProficiency {
    rank: string;
    attributeId: string;
    modifier: number;
}

export interface CalculatedAction {
    category: string;
    name: string;
    cost: string;
    modifier?: number | null;
    range?: number | null;
    area?: unknown;
    description: string;
}

// Données qui seront progressivement ajoutées à CalculatedCharacter.

export interface CharacterHitPoints {
    current: number;
    maximum: number;
    temporary: number;
}

export interface CharacterSpeed {
    type: string;
    value: number;
    unit?: string;
}

export interface CharacterSense {
    name: string;
    description?: string;
}

export interface CharacterResistance {
    type: string;
    value: number;
    description?: string;
}

export interface CharacterSheetExtensions {
    hitPoints?: CharacterHitPoints;
    armorClass?: number;
    speeds?: CharacterSpeed[];
    senses?: CharacterSense[];
    resistances?: CharacterResistance[];
    focusPoints?: {
        current: number;
        maximum: number;
    };
    resources?: {
        name: string;
        current?: number;
        maximum?: number;
        description?: string;
    }[];
    conditions?: string[];
}

export type HitPointOperation = "damage" | "heal" | "temporary";

interface CharacterSheetProps {
    character: CalculatedCharacter;
    extensions?: CharacterSheetExtensions;

    onHitPointChange?: (operation: HitPointOperation, amount: number) => void;
}

// -----------------------------------------------------------------------------
// Labels and formatting
// -----------------------------------------------------------------------------

const ATTRIBUTE_LABELS: Record<string, string> = {
    strength: "Force",
    dexterity: "Dextérité",
    constitution: "Constitution",
    intelligence: "Intelligence",
    wisdom: "Sagesse",
    charisma: "Charisme",
};

const ATTRIBUTE_SHORT_LABELS: Record<string, string> = {
    strength: "FOR",
    dexterity: "DEX",
    constitution: "CON",
    intelligence: "INT",
    wisdom: "SAG",
    charisma: "CHA",
};

const PROFICIENCY_LABELS: Record<string, string> = {
    untrained: "Non entraîné",
    trained: "Qualifié",
    expert: "Expert",
    master: "Maître",
    legendary: "Légendaire",
};

const SKILL_LABELS: Record<string, string> = {
    acrobatics: "Acrobaties",
    arcana: "Arcanes",
    athletics: "Athlétisme",
    crafting: "Artisanat",
    deception: "Duperie",
    diplomacy: "Diplomatie",
    intimidation: "Intimidation",
    medicine: "Médecine",
    nature: "Nature",
    occultism: "Occultisme",
    performance: "Représentation",
    religion: "Religion",
    society: "Société",
    stealth: "Discrétion",
    survival: "Survie",
    thievery: "Vol",
};

const SAVE_LABELS: Record<string, string> = {
    fortitude: "Vigueur",
    reflexes: "Réflexes",
    will: "Volonté",
};

const ACTION_CATEGORY_LABELS: Record<string, string> = {
    action: "Action",
    reaction: "Réaction",
    free: "Action gratuite",
    passive: "Passif",
};

const ACTION_COST_LABELS: Record<string, string> = {
    one: "1 action",
    two: "2 actions",
    three: "3 actions",
    reaction: "Réaction",
    free: "Gratuit",
};

function formatLabel(value: string): string {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/^./, (letter) => letter.toUpperCase());
}

function formatModifier(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
}

function formatRank(rank: string): string {
    return PROFICIENCY_LABELS[rank.toLowerCase()] ?? formatLabel(rank);
}

function formatAttribute(attributeId: string): string {
    return (
        ATTRIBUTE_LABELS[attributeId.toLowerCase()] ?? formatLabel(attributeId)
    );
}

function formatActionCost(cost: string): string {
    return ACTION_COST_LABELS[cost.toLowerCase()] ?? formatLabel(cost);
}

function formatArea(area: unknown): string | null {
    if (area == null) return null;
    if (typeof area === "string") return area;

    // À adapter à la structure exacte de Area.
    if (typeof area === "object") {
        return Object.entries(area as Record<string, unknown>)
            .map(([key, value]) => `${formatLabel(key)} : ${String(value)}`)
            .join(", ");
    }

    return String(area);
}

// -----------------------------------------------------------------------------
// Small components
// -----------------------------------------------------------------------------

function Section({
    title,
    children,
    className = "",
}: {
    title: string;
    children: preact.ComponentChildren;
    className?: string;
}) {
    return (
        <section class={`character-section ${className}`}>
            <h2 class="character-section__title">{title}</h2>
            {children}
        </section>
    );
}

function ProficiencyRow({
    label,
    proficiency,
}: {
    label: string;
    proficiency: CalculatedProficiency;
}) {
    return (
        <div class="proficiency-row">
            <span class="proficiency-row__name">{label}</span>
            <span class="proficiency-row__rank">
                {formatRank(proficiency.rank)}
            </span>
            <span class="proficiency-row__attribute">
                {formatAttribute(proficiency.attributeId)}
            </span>
            <strong class="proficiency-row__modifier">
                {formatModifier(proficiency.modifier)}
            </strong>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Hit points
// -----------------------------------------------------------------------------

function HitPointsPanel({
    hitPoints,
    onChange,
}: {
    hitPoints?: CharacterHitPoints;
    onChange?: (operation: HitPointOperation, amount: number) => void;
}) {
    const [amount, setAmount] = useState(1);

    if (!hitPoints) {
        return (
            <div class="character-placeholder">
                <span>Points de vie</span>
                <strong>Non renseignés</strong>
            </div>
        );
    }

    const { current, maximum, temporary } = hitPoints;
    const percentage =
        maximum > 0 ? Math.max(0, Math.min(100, (current / maximum) * 100)) : 0;

    const apply = (operation: HitPointOperation) => {
        if (!onChange || amount <= 0) return;
        onChange(operation, amount);
    };

    return (
        <div class="hp-panel">
            <div class="hp-panel__values">
                <div>
                    <strong class="hp-panel__current">{current}</strong>
                    <span class="hp-panel__separator"> / {maximum} PV</span>
                </div>

                {temporary > 0 && (
                    <span class="hp-panel__temporary">
                        +{temporary} PV temporaires
                    </span>
                )}
            </div>

            <div
                class="hp-bar"
                role="progressbar"
                aria-valuenow={current}
                aria-valuemin={0}
                aria-valuemax={maximum}
                aria-label="Points de vie"
            >
                <div class="hp-bar__fill" style={{ width: `${percentage}%` }} />
            </div>

            <div class="hp-controls">
                <label class="hp-controls__label" for="hp-amount">
                    Quantité
                </label>
                <input
                    id="hp-amount"
                    type="number"
                    min="1"
                    value={amount}
                    onInput={(event) => {
                        const value = Number(event.currentTarget.value);
                        setAmount(
                            Number.isFinite(value) ? Math.max(1, value) : 1,
                        );
                    }}
                />

                <div class="hp-controls__buttons">
                    <button
                        type="button"
                        class="button button--damage"
                        disabled={!onChange}
                        onClick={() => apply("damage")}
                    >
                        Subir des dégâts
                    </button>
                    <button
                        type="button"
                        class="button button--heal"
                        disabled={!onChange}
                        onClick={() => apply("heal")}
                    >
                        Soigner
                    </button>
                    <button
                        type="button"
                        class="button button--temporary"
                        disabled={!onChange}
                        onClick={() => apply("temporary")}
                    >
                        PV temporaires
                    </button>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------

export function CharacterSheet({
    character,
    extensions = {},
    onHitPointChange,
}: CharacterSheetProps) {
    const { attributes, proficiencies, actions } = character;

    const speeds = extensions.speeds ?? [];
    const senses = extensions.senses ?? [];
    const resistances = extensions.resistances ?? [];

    const skills = Object.entries(proficiencies.skills).sort(([a], [b]) => {
        const labelA = SKILL_LABELS[a] ?? formatLabel(a);
        const labelB = SKILL_LABELS[b] ?? formatLabel(b);
        return labelA.localeCompare(labelB, "fr");
    });

    const actionsByCategory = actions.reduce<
        Record<string, CalculatedAction[]>
    >((groups, action) => {
        const category = action.category.toLowerCase();
        (groups[category] ??= []).push(action);
        return groups;
    }, {});

    return (
        <main class="character-sheet">
            {/* Header */}
            <header class="character-header">
                <div class="character-header__identity">
                    <div class="character-header__portrait">
                        {character.name.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                        <p class="character-header__eyebrow">
                            Fiche de personnage
                        </p>
                        <h1>{character.name || "Personnage sans nom"}</h1>
                    </div>
                </div>
            </header>

            {/* Vital statistics */}
            <div class="character-overview">
                <Section
                    title="Points de vie"
                    className="character-section--vitals"
                >
                    <HitPointsPanel
                        hitPoints={extensions.hitPoints}
                        onChange={onHitPointChange}
                    />
                </Section>

                <Section
                    title="Défenses"
                    className="character-section--defenses"
                >
                    <div class="defense-stat">
                        <span>Classe d'armure</span>
                        <strong>{extensions.armorClass ?? "—"}</strong>
                    </div>

                    <div class="defense-stat">
                        <span>Perception</span>
                        <strong>
                            {formatModifier(proficiencies.perception.modifier)}
                        </strong>
                    </div>

                    <div class="defense-stat">
                        <span>Vigueur</span>
                        <strong>
                            {formatModifier(
                                proficiencies.saves.fortitude.modifier,
                            )}
                        </strong>
                    </div>

                    <div class="defense-stat">
                        <span>Réflexes</span>
                        <strong>
                            {formatModifier(
                                proficiencies.saves.reflexes.modifier,
                            )}
                        </strong>
                    </div>

                    <div class="defense-stat">
                        <span>Volonté</span>
                        <strong>
                            {formatModifier(proficiencies.saves.will.modifier)}
                        </strong>
                    </div>
                </Section>
            </div>

            {/* Attributes */}
            <Section title="Attributs">
                <div class="attribute-grid">
                    {Object.entries(attributes).map(([key, value]) => (
                        <div class="attribute-card" key={key}>
                            <span class="attribute-card__short">
                                {ATTRIBUTE_SHORT_LABELS[key] ??
                                    key.toUpperCase()}
                            </span>
                            <strong>{formatModifier(value)}</strong>
                            <span class="attribute-card__name">
                                {ATTRIBUTE_LABELS[key] ?? formatLabel(key)}
                            </span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Proficiencies */}
            <Section title="Maîtrises">
                <div class="proficiency-groups">
                    <div class="proficiency-group">
                        <h3>Perception</h3>
                        <ProficiencyRow
                            label="Perception"
                            proficiency={proficiencies.perception}
                        />
                    </div>

                    <div class="proficiency-group">
                        <h3>Sauvegardes</h3>
                        {Object.entries(proficiencies.saves).map(
                            ([key, value]) => (
                                <ProficiencyRow
                                    key={key}
                                    label={SAVE_LABELS[key] ?? formatLabel(key)}
                                    proficiency={value}
                                />
                            ),
                        )}
                    </div>

                    <div class="proficiency-group">
                        <h3>Compétences</h3>
                        {skills.length > 0 ? (
                            skills.map(([key, value]) => (
                                <ProficiencyRow
                                    key={key}
                                    label={
                                        SKILL_LABELS[key] ?? formatLabel(key)
                                    }
                                    proficiency={value}
                                />
                            ))
                        ) : (
                            <p class="character-empty">
                                Aucune compétence renseignée.
                            </p>
                        )}
                    </div>
                </div>
            </Section>

            {/* Mobility */}
            <Section title="Déplacements">
                {speeds.length > 0 ? (
                    <div class="info-chip-list">
                        {speeds.map((speed) => (
                            <div class="info-chip" key={speed.type}>
                                <span>{formatLabel(speed.type)}</span>
                                <strong>
                                    {speed.value} {speed.unit ?? "m"}
                                </strong>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p class="character-empty">
                        Aucune vitesse particulière renseignée.
                    </p>
                )}
            </Section>

            {/* Senses */}
            <Section title="Sens">
                {senses.length > 0 ? (
                    <div class="detail-list">
                        {senses.map((sense) => (
                            <div class="detail-list__item" key={sense.name}>
                                <strong>{sense.name}</strong>
                                {sense.description && (
                                    <span>{sense.description}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p class="character-empty">Aucun sens spécial renseigné.</p>
                )}
            </Section>

            {/* Resistances */}
            <Section title="Résistances et immunités">
                {resistances.length > 0 ? (
                    <div class="detail-list">
                        {resistances.map((resistance, index) => (
                            <div
                                class="detail-list__item"
                                key={`${resistance.type}-${index}`}
                            >
                                <strong>
                                    {formatLabel(resistance.type)}
                                    {resistance.value > 0 &&
                                        ` ${resistance.value}`}
                                </strong>
                                {resistance.description && (
                                    <span>{resistance.description}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p class="character-empty">
                        Aucune résistance ou immunité renseignée.
                    </p>
                )}
            </Section>

            {/* Actions */}
            <Section title="Actions" className="character-section--actions">
                {Object.keys(actionsByCategory).length > 0 ? (
                    <div class="action-groups">
                        {Object.entries(actionsByCategory).map(
                            ([category, categoryActions]) => (
                                <div class="action-group" key={category}>
                                    <h3>
                                        {ACTION_CATEGORY_LABELS[category] ??
                                            formatLabel(category)}
                                    </h3>

                                    <div class="action-list">
                                        {categoryActions.map(
                                            (action, index) => (
                                                <article
                                                    class="action-card"
                                                    key={`${action.name}-${index}`}
                                                >
                                                    <div class="action-card__header">
                                                        <h4>{action.name}</h4>
                                                        <span class="action-card__cost">
                                                            {formatActionCost(
                                                                action.cost,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div class="action-card__metadata">
                                                        {action.modifier !=
                                                            null && (
                                                            <span>
                                                                Bonus :{" "}
                                                                {formatModifier(
                                                                    action.modifier,
                                                                )}
                                                            </span>
                                                        )}
                                                        {action.range !=
                                                            null && (
                                                            <span>
                                                                Portée :{" "}
                                                                {action.range} m
                                                            </span>
                                                        )}
                                                        {action.area !=
                                                            null && (
                                                            <span>
                                                                Zone :{" "}
                                                                {formatArea(
                                                                    action.area,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {action.description && (
                                                        <p class="action-card__description">
                                                            {action.description}
                                                        </p>
                                                    )}
                                                </article>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                ) : (
                    <p class="character-empty">Aucune action renseignée.</p>
                )}
            </Section>

            {/* Future character-specific resources */}
            <Section title="Ressources et capacités">
                {extensions.focusPoints && (
                    <div class="resource-row">
                        <span>Points de focalisation</span>
                        <strong>
                            {extensions.focusPoints.current} /{" "}
                            {extensions.focusPoints.maximum}
                        </strong>
                    </div>
                )}

                {extensions.resources?.map((resource) => (
                    <div class="resource-row" key={resource.name}>
                        <div>
                            <strong>{resource.name}</strong>
                            {resource.description && (
                                <p>{resource.description}</p>
                            )}
                        </div>
                        {resource.current != null &&
                            resource.maximum != null && (
                                <strong>
                                    {resource.current} / {resource.maximum}
                                </strong>
                            )}
                    </div>
                ))}

                {!extensions.focusPoints && !extensions.resources?.length && (
                    <p class="character-empty">
                        Les ressources et capacités spécifiques à la classe
                        apparaîtront ici.
                    </p>
                )}
            </Section>

            {/* Conditions */}
            <Section title="États">
                {extensions.conditions?.length ? (
                    <div class="info-chip-list">
                        {extensions.conditions.map((condition) => (
                            <span class="info-chip" key={condition}>
                                {formatLabel(condition)}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p class="character-empty">Aucun état actif.</p>
                )}
            </Section>
        </main>
    );
}
