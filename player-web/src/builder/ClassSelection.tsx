import { useDraft } from "../contexts/useDraft";
import { type Class } from "../../../shared/schemas/class";
import { type Feat } from "../../../shared/schemas/feat";
import { attributeNames } from "../../../shared/rules/attributes";
import { useRules } from "../../../shared/contexts/rules";
import type { Subclass } from "../../../shared/schemas/subclass";
import RichText from "../../../shared/components/RichText";

export default function ClassSelection() {
    const { draft } = useDraft();
    const { classes, feats } = useRules();

    const selectedClass =
        classes.data?.find((item) => item.id === draft.classId) ?? null;

    return (
        <>
            <p>
                Choisis une classe correspondant au rôle que tu souhaites jouer.
                Tu pourras ensuite préciser ta spécialisation.
            </p>

            {feats.error && (
                <p role="alert">
                    Impossible de charger les dons : {feats.error}
                </p>
            )}

            <ClassSelector selected={selectedClass} />
            <SubclassSelector selectedClass={selectedClass} />
            <ClassFeatSelector selectedClass={selectedClass} />
        </>
    );
}

function ClassSelector({ selected }: { selected: Class | null }) {
    const {
        classes: { data, loading, error },
        feats: { data: feats },
    } = useRules();
    const { dispatch } = useDraft();

    if (loading) {
        return <p role="status">Chargement des classes…</p>;
    }

    if (error) {
        return <p role="alert">Impossible de charger les classes : {error}</p>;
    }

    if (data!.length === 0) {
        return <p>Aucune classe n'est disponible pour le moment.</p>;
    }

    return (
        <div class="choice-grid choice-grid--class">
            {data!.map((item) => (
                <ClassItem
                    key={item.id}
                    item={item}
                    feats={feats ?? []}
                    isSelected={selected?.id === item.id}
                    select={() =>
                        dispatch({ type: "select-class", classId: item.id })
                    }
                />
            ))}
        </div>
    );
}

type ItemProps<Data> = {
    item: Data;
    feats: Feat[];
    isSelected: boolean;
    select: () => void;
};

function ClassItem(props: ItemProps<Class>) {
    const { item, feats, isSelected, select } = props;

    const keyAttributes = item.keyAttributes
        .map((attribute) => attributeNames[attribute])
        .join(" ou ");

    const features = resolveFeats(item.featureIds, feats);

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

            <dl class="choice-stats">
                <div>
                    <dt>Points de vie</dt>
                    <dd>{item.hitPointsPerLevel} par niveau</dd>
                </div>
                <div>
                    <dt>Caractéristique principale</dt>
                    <dd>{keyAttributes}</dd>
                </div>
            </dl>

            <FeatPreview
                title="Capacités de classe"
                items={features.slice(0, 3)}
                total={features.length}
            />

            <span>
                {isSelected ? "✓ Classe sélectionnée" : "Choisir cette classe"}
            </span>
        </button>
    );
}

function SubclassSelector({ selectedClass }: { selectedClass: Class | null }) {
    const {
        subclasses: { data: subclasses, loading, error },
        feats,
    } = useRules();
    const { draft, dispatch } = useDraft();

    if (loading) {
        return <p role="status">Chargement des spécialisations...</p>;
    }

    if (error) {
        return (
            <p role="alert">
                Impossible de charger les spécialisations : {error}
            </p>
        );
    }

    const availableSubclasses =
        subclasses?.filter((item) => item.classId === selectedClass?.id) ?? [];

    if (!availableSubclasses!.length) {
        return <></>;
    }

    return (
        <section class="subclass-selection">
            <h3>Spécialisation</h3>
            <p>Choisis une spécialisation pour {selectedClass!.name}.</p>

            <div class="choice-grid">
                {availableSubclasses.map((subclass) => (
                    <SubclassItem
                        key={subclass.id}
                        item={subclass}
                        feats={feats.data ?? []}
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
    );
}

function SubclassItem(props: ItemProps<Subclass>) {
    const { item, feats, isSelected, select } = props;

    const features = resolveFeats(item.featureIds, feats);

    return (
        <button
            type="button"
            class={`choice-card ${isSelected ? "selected" : ""}`}
            aria-pressed={isSelected}
            onClick={select}
        >
            <h3>{item.name}</h3>
            <span class="choice-meta">{item.role}</span>
            <p>{item.description}</p>

            <FeatPreview
                title="Capacités de spécialisation"
                items={features.slice(0, 3)}
                total={features.length}
            />

            <span class="option-meta">
                {isSelected ? "✓ Sélectionnée" : "Choisir"}
            </span>
        </button>
    );
}

function resolveFeats(ids: string[], feats: Feat[]): Feat[] {
    return ids
        .map((id) => feats.find((feat) => feat.id === id))
        .filter((feat): feat is Feat => feat !== undefined);
}

function FeatPreview({
    title,
    items,
    total,
}: {
    title: string;
    items: Feat[];
    total?: number;
}) {
    if (items.length === 0) return null;

    return (
        <div class="class-features">
            <h4>{title}</h4>
            <ul>
                {items.map((feat) => (
                    <li key={feat.id}>
                        <strong>{feat.name}</strong>
                        <p>{feat.description}</p>
                    </li>
                ))}
            </ul>

            {total !== undefined && total > items.length && (
                <span class="feat-count">
                    + {total - items.length} autre(s)
                </span>
            )}
        </div>
    );
}

function ClassFeatSelector({ selectedClass }: { selectedClass: Class | null }) {
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
