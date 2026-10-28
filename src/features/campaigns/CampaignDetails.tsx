import { useEffect, useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import "./campaign-details.css";

type Campaign = {
    id: string;
    name: string;
    description: string;
    system: string;
    createdAt: number;
};

type Attributes = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
};

interface CharacterSummary {
    id: string;
    name: string;
    level: number;
    speciesId: string;
    classId: string;
}

type CampaignDetailsProps = {
    campaignId: string;
    onBack: () => void;
};

const defaultAttributes: Attributes = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
};

const attributeLabels: { key: keyof Attributes; label: string }[] = [
    { key: "strength", label: "Force" },
    { key: "dexterity", label: "Dextérité" },
    { key: "constitution", label: "Constitution" },
    { key: "intelligence", label: "Intelligence" },
    { key: "wisdom", label: "Sagesse" },
    { key: "charisma", label: "Charisme" },
];

export function CampaignDetails({ campaignId, onBack }: CampaignDetailsProps) {
    const { campaign, loading, error } = useCampaign(campaignId);
    const [characters, charactersError, reloadCharacters] =
        useCharacters(campaignId);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [name, setName] = useState("");
    const [level, setLevel] = useState(1);
    const [attributes, setAttributes] = useState<Attributes>({
        ...defaultAttributes,
    });
    const [speciesId, setSpeciesId] = useState("");
    const [heritageId, setHeritageId] = useState("");
    const [classId, setClassId] = useState("");

    const [saving, setSaving] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    async function handleCreateCharacter(event: SubmitEvent) {
        event.preventDefault();

        if (saving) return;

        setSaving(true);
        setCreateError(null);

        try {
            await invoke("create_character", {
                campaignId,
                name: name.trim(),
                level,
                attributes,
                speciesId: speciesId.trim(),
                heritageId: heritageId.trim() || null,
                classId: classId.trim(),
            });

            setName("");
            setLevel(1);
            setAttributes({ ...defaultAttributes });
            setSpeciesId("");
            setHeritageId("");
            setClassId("");
            setShowCreateForm(false);

            await reloadCharacters();
        } catch (err) {
            setCreateError(String(err));
        } finally {
            setSaving(false);
        }
    }

    function updateAttribute(key: keyof Attributes, value: string) {
        const parsed = Number(value);

        setAttributes((current) => ({
            ...current,
            [key]: Number.isFinite(parsed) ? parsed : 0,
        }));
    }

    return (
        <main class="campaign-details-page">
            <button type="button" onClick={onBack}>
                ← Retour aux campagnes
            </button>

            {loading && <p>Chargement...</p>}

            {error && (
                <p role="alert" class="error-message">
                    {error}
                </p>
            )}

            {campaign && !loading && (
                <>
                    <header class="page-header">
                        <p class="eyebrow">CAMPAGNE</p>
                        <h1>{campaign.name}</h1>
                        <p class="muted">{campaign.system}</p>
                    </header>

                    <section class="panel">
                        <h2>Aperçu</h2>
                        <p>{campaign.description || "Aucune description."}</p>
                        <p class="muted">
                            Créée le{" "}
                            {new Date(
                                campaign.createdAt * 1000,
                            ).toLocaleDateString("fr-FR")}
                        </p>
                    </section>

                    <section class="panel">
                        <div class="section-heading">
                            <h2>Personnages</h2>

                            <button
                                type="button"
                                onClick={() => {
                                    setCreateError(null);
                                    setShowCreateForm((current) => !current);
                                }}
                            >
                                {showCreateForm
                                    ? "Annuler"
                                    : "Créer un personnage"}
                            </button>
                        </div>

                        {charactersError && (
                            <p role="alert" class="error-message">
                                {charactersError}
                            </p>
                        )}

                        {!charactersError && characters.length === 0 && (
                            <p>Aucun personnage pour le moment.</p>
                        )}

                        {characters.length > 0 && (
                            <ul class="character-list">
                                {characters.map((character) => (
                                    <li key={character.id}>
                                        <strong>{character.name}</strong>
                                        {" — Niveau "}
                                        {character.level}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {showCreateForm && (
                            <form
                                class="character-form"
                                onSubmit={handleCreateCharacter}
                            >
                                <h3>Nouveau personnage</h3>

                                <label>
                                    Nom
                                    <input
                                        type="text"
                                        value={name}
                                        onInput={(event) =>
                                            setName(event.currentTarget.value)
                                        }
                                        required
                                        maxLength={100}
                                    />
                                </label>

                                <label>
                                    Niveau
                                    <input
                                        type="number"
                                        min={1}
                                        value={level}
                                        onInput={(event) =>
                                            setLevel(
                                                Number(
                                                    event.currentTarget.value,
                                                ),
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <fieldset>
                                    <legend>Caractéristiques</legend>

                                    <div class="attributes-grid">
                                        {attributeLabels.map(
                                            ({ key, label }) => (
                                                <label key={key}>
                                                    {label}
                                                    <input
                                                        type="number"
                                                        value={attributes[key]}
                                                        onInput={(event) =>
                                                            updateAttribute(
                                                                key,
                                                                event
                                                                    .currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </label>
                                            ),
                                        )}
                                    </div>
                                </fieldset>

                                <label>
                                    Espèce
                                    <input
                                        type="text"
                                        value={speciesId}
                                        onInput={(event) =>
                                            setSpeciesId(
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Identifiant de l'espèce"
                                        required
                                    />
                                </label>

                                <label>
                                    Héritage (facultatif)
                                    <input
                                        type="text"
                                        value={heritageId}
                                        onInput={(event) =>
                                            setHeritageId(
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Identifiant de l'héritage"
                                    />
                                </label>

                                <label>
                                    Classe
                                    <input
                                        type="text"
                                        value={classId}
                                        onInput={(event) =>
                                            setClassId(
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Identifiant de la classe"
                                        required
                                    />
                                </label>

                                {createError && (
                                    <p role="alert" class="error-message">
                                        {createError}
                                    </p>
                                )}

                                <button type="submit" disabled={saving}>
                                    {saving
                                        ? "Création en cours..."
                                        : "Créer le personnage"}
                                </button>
                            </form>
                        )}
                    </section>

                    <section class="panel">
                        <h2>Cartes</h2>
                        <p class="muted">
                            Les cartes seront ajoutées plus tard.
                        </p>
                    </section>
                </>
            )}
        </main>
    );
}

function useCampaign(campaignId: string) {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError("");
        setCampaign(null);

        invoke<Campaign>("get_campaign", { id: campaignId })
            .then((result) => {
                if (!cancelled) setCampaign(result);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(String(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [campaignId]);

    return { campaign, loading, error };
}

function useCharacters(
    campaignId: string,
): [CharacterSummary[], string | null, () => Promise<void>] {
    const [characters, setCharacters] = useState<CharacterSummary[]>([]);
    const [charactersError, setCharactersError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    async function reloadCharacters() {
        setRefreshKey((current) => current + 1);
    }

    useEffect(() => {
        let cancelled = false;

        invoke<CharacterSummary[]>("list_characters", {
            campaignId,
        })
            .then((result) => {
                if (!cancelled) {
                    setCharacters(result);
                    setCharactersError(null);
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setCharactersError(String(error));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [campaignId, refreshKey]);

    return [characters, charactersError, reloadCharacters];
}
