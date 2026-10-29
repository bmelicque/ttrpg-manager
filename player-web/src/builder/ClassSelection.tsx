import { useDraft } from "../contexts/useDraft";
import { type Class } from "../../../shared/schemas/class";
import { attributeNames } from "../../../shared/rules/attributes";
import { useRules } from "../../../shared/contexts/rules";
import type { Subclass } from "../../../shared/schemas/subclass";

export default function ClassSelection() {
    const { draft, dispatch } = useDraft();
    const { classes, subclasses } = useRules();
    const selectedClass =
        classes.data?.find((item) => item.id === draft.classId) ?? null;
    const availableSubclasses = selectedClass
        ? (subclasses.data?.filter(
              (item) => item.classId === selectedClass.id,
          ) ?? [])
        : [];

    if (classes.loading) {
        return <p role="status">Chargement des classes…</p>;
    }
    if (classes.error) {
        return (
            <p role="alert">
                Impossible de charger les classes : {classes.error}
            </p>
        );
    }
    if (classes.data!.length === 0) {
        return <p>Aucune classe n'est disponible pour le moment.</p>;
    }

    const showSubclasses =
        selectedClass != null && availableSubclasses.length > 0;

    return (
        <>
            <p>
                Choisis une classe correspondant au rôle que tu souhaites jouer.
                Tu pourras ensuite préciser ta spécialisation.
            </p>

            <div class="choice-grid choice-grid--class">
                {classes.data!.map((item) => (
                    <ClassItem
                        key={item.id}
                        item={item}
                        isSelected={selectedClass?.id === item.id}
                        select={() =>
                            dispatch({ type: "select-class", classId: item.id })
                        }
                    />
                ))}
            </div>

            {showSubclasses && (
                <section className="subclass-selection">
                    <h3>Spécialisation</h3>
                    <p>Choisis une spécialisation pour {selectedClass.name}.</p>

                    <div class="choice-grid">
                        {availableSubclasses.map((subclass) => (
                            <SubclassItem
                                key={subclass.id}
                                item={subclass}
                                isSelected={draft.subclassId === subclass.id}
                                select={() =>
                                    dispatch({
                                        type: "select-subclass",
                                        subclassId: subclass.id,
                                    })
                                }
                            />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

type ItemProps<Data> = {
    item: Data;
    isSelected: boolean;
    select: () => void;
};
function ClassItem(props: ItemProps<Class>) {
    const { item, isSelected, select } = props;
    // const { features } = useRules();

    const keyAttributes = item.keyAttributes
        .map((attribute) => attributeNames[attribute])
        .join(" ou ");

    // const mainFeatures = item.featureIds
    //     .map((id) => features.find((feature) => feature.id === id))
    //     .filter((feature) => feature !== undefined)
    //     .slice(0, 3);

    return (
        <button
            type="button"
            class={`choice-card choice-card--class ${isSelected ? "selected" : ""}`}
            aria-pressed={isSelected}
            onClick={select}
        >
            <h3>{item.name}</h3>
            <span class="choice-meta">{item.role}</span>
            <p>{item.description}</p>

            <dl class="class-stats">
                <div>
                    <dt>Points de vie</dt>
                    <dd>{item.hitPointsPerLevel} par niveau</dd>
                </div>
                <div>
                    <dt>Caractéristique principale</dt>
                    <dd>{keyAttributes}</dd>
                </div>
            </dl>

            {/** mainFeatures.length > 0 && (
                <div class="class-features">
                    <h4>Capacités clés</h4>
                    <ul>
                        {mainFeatures.map((feature: any) => (
                            <li key={feature.id}>
                                <strong>{feature.name}</strong>
                                {feature.description && (
                                    <p>{feature.description}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) */}

            <span>
                {isSelected ? "✓ Classe sélectionnée" : "Choisir cette classe"}
            </span>
        </button>
    );
}

function SubclassItem(props: ItemProps<Subclass>) {
    const { item, isSelected, select } = props;
    return (
        <button
            key={item.id}
            type="button"
            class={`choice-card ${isSelected ? "selected" : ""}`}
            aria-pressed={isSelected}
            onClick={select}
        >
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span class="option-meta">
                {isSelected ? "✓ Sélectionnée" : "Choisir"}
            </span>
        </button>
    );
}
