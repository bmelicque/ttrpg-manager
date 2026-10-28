import { useCallback, useEffect, useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import "./campaigns.css";

type Campaign = {
    id: string;
    name: string;
    description: string;
    system: string;
    createdAt: number;
};

type CampaignsProps = {
    onOpen: (campaignId: string) => void;
};

export function Campaigns({ onOpen }: CampaignsProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [system, setSystem] = useState("my-system");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const loadCampaigns = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await invoke<Campaign[]>("list_campaigns");
            setCampaigns(result);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCampaigns();
    }, [loadCampaigns]);

    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (!name.trim()) {
            setError("Renseignez un nom de campagne.");
            return;
        }

        setCreating(true);
        setError("");

        try {
            const campaign = await invoke<Campaign>("create_campaign", {
                name,
                description,
                system,
            });

            setCampaigns((current) =>
                [...current, campaign].sort((a, b) =>
                    a.name.localeCompare(b.name),
                ),
            );

            setName("");
            setDescription("");
            setSystem("my-system");
        } catch (err) {
            setError(String(err));
        } finally {
            setCreating(false);
        }
    }

    return (
        <section class="campaigns-page">
            <header class="page-header">
                <div>
                    <p class="eyebrow">VOS AVENTURES</p>
                    <h1>Campagnes</h1>
                    <p class="page-description">
                        Créez et gérez vos aventures.
                    </p>
                </div>
            </header>

            {error && (
                <div class="error-message" role="alert">
                    {error}
                </div>
            )}

            <div class="campaigns-grid">
                <section class="panel">
                    <h2>Nouvelle campagne</h2>

                    <form onSubmit={handleSubmit} class="campaign-form">
                        <label>
                            Nom de la campagne
                            <input
                                value={name}
                                onInput={(event) =>
                                    setName(event.currentTarget.value)
                                }
                                placeholder="Le Royaume Perdu"
                                maxLength={120}
                                required
                            />
                        </label>

                        <label>
                            Description
                            <textarea
                                value={description}
                                onInput={(event) =>
                                    setDescription(event.currentTarget.value)
                                }
                                placeholder="Quelques mots pour décrire votre campagne..."
                                rows={3}
                                maxLength={2000}
                            />
                        </label>

                        <label>
                            Système de jeu (ID)
                            <input
                                value={system}
                                onInput={(event) =>
                                    setSystem(event.currentTarget.value)
                                }
                                placeholder="my-system"
                                maxLength={100}
                            />
                            <span class="field-hint">
                                Il s'agit d'un identifiant temporaire&nbsp;; la
                                configuration du système viendra plus tard.
                            </span>
                        </label>

                        <button type="submit" disabled={creating}>
                            {creating ? "Création..." : "Créer une campagne"}
                        </button>
                    </form>
                </section>

                <section class="panel">
                    <div class="section-heading">
                        <h2>Vos campagnes</h2>
                        <button
                            type="button"
                            class="secondary-button"
                            onClick={() => void loadCampaigns()}
                            disabled={loading}
                        >
                            Rafraîchir
                        </button>
                    </div>

                    {loading ? (
                        <p class="muted">Chargement des campagnes...</p>
                    ) : campaigns.length === 0 ? (
                        <div class="empty-state">
                            <h3>Aucune campagne pour l'instant</h3>
                            <p>
                                Créez votre première campagne pour commencer !
                            </p>
                        </div>
                    ) : (
                        <ul class="campaign-list">
                            {campaigns.map((campaign) => (
                                <li key={campaign.id} class="campaign-item">
                                    <div class="campaign-item-main">
                                        <h3>{campaign.name}</h3>
                                        {campaign.description && (
                                            <p>{campaign.description}</p>
                                        )}
                                        <span class="campaign-meta">
                                            Système&nbsp;:{" "}
                                            {campaign.system || "Not specified"}
                                        </span>
                                    </div>
                                    <span class="campaign-date">
                                        {new Date(
                                            campaign.createdAt * 1000,
                                        ).toLocaleDateString()}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onOpen(campaign.id)}
                                    >
                                        Ouvrir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </section>
    );
}
