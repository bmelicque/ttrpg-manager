import { useEffect, useState } from "preact/hooks";

import { getCampaignCharacter } from "../api/characters";
import { CharacterSheet } from "../../../src/shared/CharacterSheet";
import type { CalculatedCharacter } from "../../../shared/schemas/character";

interface CharacterSheetPageProps {
    id: string;
}

export function CharacterSheetPage({ id }: CharacterSheetPageProps) {
    const { character, loading, error } = useCharacter(id);

    if (loading) return <p>Chargement du personnage…</p>;

    if (error) return <div class="error-message">{error}</div>;

    if (!character) return <p>Personnage introuvable.</p>;

    return <CharacterSheet character={character} />;
}

function useCharacter(id: string) {
    const [character, setCharacter] = useState<CalculatedCharacter | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadCharacter() {
            setLoading(true);
            setError(null);

            try {
                const result = await getCampaignCharacter(id);

                if (!cancelled) {
                    setCharacter(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Impossible de charger le personnage.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadCharacter();

        return () => {
            cancelled = true;
        };
    }, [id]);

    return { character, loading, error };
}
