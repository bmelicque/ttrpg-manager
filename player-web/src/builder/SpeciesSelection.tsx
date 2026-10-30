import { useDraft } from "../contexts/useDraft";
import { useRules } from "../../../shared/contexts/rules";
import type { Species } from "../../../shared/schemas/species";
import type { Heritage } from "../../../shared/schemas/heritage";
import type { Feat } from "../../../shared/schemas/feat";
import RichText from "../../../shared/components/RichText";

export default function SpeciesSelection() {
    const { draft, dispatch } = useDraft();
    const { species, heritages, feats } = useRules();

    const selectedSpecies =
        species.data?.find((item) => item.id === draft.speciesId) ?? null;

    const availableHeritages = selectedSpecies
        ? (heritages.data?.filter((item) =>
              selectedSpecies.heritageIds.includes(item.id),
          ) ?? [])
        : [];

    const selectedHeritage =
        availableHeritages.find((item) => item.id === draft.heritageId) ?? null;

    if (species.loading || heritages.loading) {
        return <p role="status">Chargement des espèces…</p>;
    }

    if (species.error || heritages.error) {
        return (
            <p role="alert">
                Impossible de charger les espèces ou héritages :
                {species.error ?? heritages.error}
            </p>
        );
    }

    if (!species.data?.length) {
        return <p>Aucune espèce n'est disponible pour le moment.</p>;
    }

    return (
        <>
            <p>Choisis l'espèce que tu souhaites incarner.</p>

            <div class="choice-grid choice-grid--species">
                {species.data.map((item) => (
                    <SpeciesItem
                        key={item.id}
                        item={item}
                        feats={feats.data ?? []}
                        isSelected={selectedSpecies?.id === item.id}
                        select={() =>
                            dispatch({
                                type: "select-species",
                                speciesId: item.id,
                            })
                        }
                    />
                ))}
            </div>

            {selectedSpecies && availableHeritages.length > 0 && (
                <section class="heritage-selection">
                    <h3>Héritage</h3>
                    <p>Choisis un héritage pour {selectedSpecies.name}.</p>

                    {availableHeritages.length === 0 ? (
                        <p>Aucun héritage disponible pour cette espèce.</p>
                    ) : (
                        <div class="choice-grid">
                            {availableHeritages.map((item) => (
                                <HeritageItem
                                    key={item.id}
                                    item={item}
                                    feats={feats.data ?? []}
                                    isSelected={
                                        selectedHeritage?.id === item.id
                                    }
                                    select={() =>
                                        dispatch({
                                            type: "select-heritage",
                                            heritageId: item.id,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </>
    );
}

type ItemProps<T> = {
    item: T;
    feats: Feat[];
    isSelected: boolean;
    select: () => void;
};

function SpeciesItem({ item, isSelected, select }: ItemProps<Species>) {
    return (
        <button
            type="button"
            class={`choice-card choice-card--species ${isSelected ? "selected" : ""}`}
            aria-pressed={isSelected}
            onClick={select}
        >
            <h3>{item.name}</h3>
            <p>{item.description}</p>

            <SpeciesStats item={item} />

            <span>
                {isSelected ? "✓ Espèce sélectionnée" : "Choisir cette espèce"}
            </span>
        </button>
    );
}

function HeritageItem({ item, isSelected, select }: ItemProps<Heritage>) {
    return (
        <button
            type="button"
            class={`choice-card ${isSelected ? "selected" : ""}`}
            aria-pressed={isSelected}
            onClick={select}
        >
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span>{isSelected ? "✓ Sélectionné" : "Choisir"}</span>
        </button>
    );
}

function SpeciesStats({ item }: { item: Species }) {
    return (
        <dl class="choice-stats">
            <div>
                <dt>Points de vie</dt>
                <dd>{item.hp}</dd>
            </div>
            <div>
                <dt>Taille</dt>
                <dd>{sizeNames[item.size]}</dd>
            </div>
            <div>
                <dt>Vitesse au sol</dt>
                <dd>{item.speeds.land} cases</dd>
            </div>
            {item.speeds.swim !== undefined && (
                <div>
                    <dt>Vitesse de nage</dt>
                    <dd>{item.speeds.swim} m</dd>
                </div>
            )}
            {item.speeds.fly !== undefined && (
                <div>
                    <dt>Vitesse de vol</dt>
                    <dd>{item.speeds.fly} m</dd>
                </div>
            )}
        </dl>
    );
}

function FeatureDetails({
    title,
    ids,
    feats,
}: {
    title: string;
    ids: string[];
    feats: Feat[];
}) {
    const features = ids
        .map((id) => feats.find((feat) => feat.id === id))
        .filter((feat): feat is Feat => feat !== undefined);

    if (features.length === 0) return null;

    return (
        <section class="species-features">
            <h4>{title}</h4>
            {features.map((feat) => (
                <article key={feat.id}>
                    <h5>{feat.name}</h5>
                    <RichText content={feat.description} />
                </article>
            ))}
        </section>
    );
}

const sizeNames: Record<Species["size"], string> = {
    tiny: "Très petite",
    small: "Petite",
    medium: "Moyenne",
    large: "Grande",
};
