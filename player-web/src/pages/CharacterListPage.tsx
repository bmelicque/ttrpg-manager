import { useEffect, useState } from "preact/hooks";

import type { CharacterSummary } from "../../../shared/schemas/character";
import { listCampaignCharacters } from "../api/characters";
import { CharacterCard } from "../components/CharacterCard";

import "./character-list.css";

export function CharacterListPage() {
    const [characters, setCharacters] = useState<CharacterSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // À connecter à l'identifiant de campagne actuel.
                const result = await listCampaignCharacters();

                if (!cancelled) {
                    setCharacters(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de charger les personnages.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section class="character-list-page">
            <header class="page-header">
                <div>
                    <h1>Personnages</h1>
                    <p>Les personnages de cette campagne.</p>
                </div>

                <a class="button button-primary" href="/characters/new">
                    + Créer un personnage
                </a>
            </header>

            {loading && <p>Chargement des personnages…</p>}

            {error && <div class="error-message">{error}</div>}

            {!loading && !error && characters.length === 0 && (
                <div class="empty-state">
                    <h2>Aucun personnage pour le moment</h2>
                    <p>Crée ton premier personnage pour commencer à jouer.</p>
                    <a class="button button-primary" href="/characters/new">
                        Créer un personnage
                    </a>
                </div>
            )}

            {!loading && !error && characters.length > 0 && (
                <div class="character-grid">
                    {characters.map((character) => (
                        <CharacterCard
                            key={character.id}
                            character={character}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
