import { useDraft, computeRemainingBudget } from "../contexts/useDraft";
import "./character-summary.css";
import { useRules } from "../../../shared/contexts/rules";
import { skills, type SkillOption } from "./SkillSelection";
import { useAttributes } from "./useAttributes";
import { formatMoney } from "../../../shared/rules/money";

const ATTRIBUTE_LABELS: Record<string, string> = {
    strength: "Force",
    dexterity: "Dextérité",
    constitution: "Constitution",
    intelligence: "Intelligence",
    wisdom: "Sagesse",
    charisma: "Charisme",
};

const DEFAULT_ATTRIBUTES = Object.fromEntries(
    Object.keys(ATTRIBUTE_LABELS).map((key) => [key, 0]),
);

export function CharacterSummary() {
    const {
        classes: { data: classes },
        subclasses: { data: subclasses },
        species: { data: species },
        heritages: { data: heritages },
        feats: { data: feats },
        items: { data: items },
    } = useRules();
    const { draft } = useDraft();
    const attributes = useAttributes();

    const selectedClass = classes?.find(({ id }) => id === draft.classId);
    const selectedSubclass = subclasses?.find(
        ({ id }) => id === draft.subclassId,
    );
    const selectedSpecies = species?.find(({ id }) => id === draft.speciesId);
    const selectedHeritage = heritages?.find(
        ({ id }) => id === draft.heritageId,
    );
    const selectedSkillFeat = feats?.find(({ id }) => id === draft.skillFeatId);

    const selectedSkills = [
        ...new Set([...(selectedClass?.skills.fixed ?? []), ...draft.skillIds]),
    ]
        .map((id) => skills.find((skill) => skill.id === id))
        .filter((skill): skill is SkillOption => skill !== undefined);

    const remainingMoney = computeRemainingBudget(
        draft.equipment.inventory,
        items ?? [],
    );

    const getItem = (itemId: string) =>
        items?.find((item) => item.id === itemId);

    return (
        <div class="character-summary">
            <section class="summary-section">
                <h2>{draft.name.trim() || "Personnage sans nom"}</h2>

                <div class="summary-identity">
                    <div>
                        <span class="summary-label">Biographie</span>
                        <p class="summary-biography">
                            {draft.biography || "Aucune biographie renseignée."}
                        </p>
                    </div>
                </div>
            </section>

            <section class="summary-section">
                <h3>Profil</h3>

                <div class="summary-profile">
                    <div class="summary-profile-item">
                        <span class="summary-label">Espèce</span>
                        <strong>
                            {selectedSpecies?.name ?? "Non sélectionnée"}
                        </strong>
                    </div>

                    <div class="summary-profile-item">
                        <span class="summary-label">Héritage</span>
                        <strong>{selectedHeritage?.name ?? "Aucun"}</strong>
                    </div>

                    <div class="summary-profile-item">
                        <span class="summary-label">Classe</span>
                        <strong>
                            {selectedClass?.name ?? "Non sélectionnée"}
                        </strong>
                    </div>

                    <div class="summary-profile-item">
                        <span class="summary-label">Sous-classe</span>
                        <strong>{selectedSubclass?.name ?? "Aucune"}</strong>
                    </div>
                </div>
            </section>

            <section class="summary-section">
                <h3>Attributs</h3>

                <div class="summary-attributes">
                    {Object.entries(attributes || DEFAULT_ATTRIBUTES).map(
                        ([id, value]) => (
                            <div class="summary-attribute" key={id}>
                                <span>{ATTRIBUTE_LABELS[id] ?? id}</span>
                                <strong
                                    class={
                                        value > 0
                                            ? "positive"
                                            : value < 0
                                              ? "negative"
                                              : ""
                                    }
                                >
                                    {value > 0 ? `+${value}` : value}
                                </strong>
                            </div>
                        ),
                    )}
                </div>
            </section>

            <section class="summary-section">
                <h3>Compétences</h3>

                {selectedSkills.length > 0 ? (
                    <ul class="summary-list">
                        {selectedSkills.map((skill) => (
                            <li key={skill.id}>
                                <span>{skill.name}</span>
                                <span class="summary-muted">
                                    {ATTRIBUTE_LABELS[skill.attribute] ??
                                        skill.attribute}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p class="summary-empty">Aucune compétence sélectionnée.</p>
                )}

                <div class="summary-feat">
                    <span class="summary-label">Don de compétence</span>
                    <strong>{selectedSkillFeat?.name ?? "Aucun"}</strong>
                </div>
            </section>

            <section class="summary-section">
                <h3>Équipement</h3>

                {draft.equipment.inventory.length > 0 ? (
                    <ul class="summary-list">
                        {draft.equipment.inventory.map((entry) => {
                            const item = getItem(entry.itemId);

                            return (
                                <li key={entry.id}>
                                    <span>
                                        {item?.name ?? entry.itemId}
                                        {entry.quantity > 1 &&
                                            ` × ${entry.quantity}`}
                                    </span>
                                    <span class="summary-muted">
                                        {item
                                            ? `${formatMoney(item.price * entry.quantity)}`
                                            : "Objet introuvable"}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p class="summary-empty">Aucun équipement sélectionné.</p>
                )}

                <div class="summary-equipment-total">
                    <span>Argent restant</span>
                    <strong>{formatMoney(remainingMoney)}</strong>
                </div>
            </section>
        </div>
    );
}
