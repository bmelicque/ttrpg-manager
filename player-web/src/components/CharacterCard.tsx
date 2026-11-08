import type { CharacterSummary } from "../../../shared/schemas/character";

interface CharacterCardProps {
    character: CharacterSummary;
}

export function CharacterCard({ character }: CharacterCardProps) {
    return (
        <a class="character-card" href={`/characters/${character.id}`}>
            <div class="character-card-content">
                <h3>{character.name}</h3>

                <p>
                    {character.className ?? "Classe inconnue"}
                    {" · "}
                    Niveau {character.level}
                </p>
            </div>

            <span class="character-card-arrow">→</span>
        </a>
    );
}
