import { useDraft } from "../contexts/useDraft";
import "./identity-selection.css";

export function IdentitySelection() {
    const { draft, dispatch } = useDraft();

    return (
        <section class="identity-selection">
            <header class="identity-intro">
                <h2>Qui est votre personnage ?</h2>
                <p>
                    Donnez-lui un nom et, si vous le souhaitez, racontez-nous
                    quelques éléments de son histoire.
                </p>
            </header>

            <div class="identity-field">
                <label for="character-name">Nom du personnage</label>

                <input
                    id="character-name"
                    type="text"
                    value={draft.name}
                    placeholder="Ex. : Aldric de Valombre"
                    maxLength={60}
                    onInput={(event) =>
                        dispatch({
                            type: "set-name",
                            name: event.currentTarget.value,
                        })
                    }
                />
            </div>

            <div class="identity-field">
                <label for="character-biography">
                    Biographie
                    <span class="identity-optional">Facultatif</span>
                </label>

                <textarea
                    id="character-biography"
                    value={draft.biography}
                    placeholder="D'où vient votre personnage ? Qu'est-ce qui le motive ? A-t-il des proches, des ennemis, des ambitions ?"
                    rows={8}
                    maxLength={2000}
                    onInput={(event) =>
                        dispatch({
                            type: "set-biography",
                            biography: event.currentTarget.value,
                        })
                    }
                />

                <div class="identity-hint">
                    <span>
                        Pas besoin de tout définir maintenant. Vous pourrez
                        modifier cette biographie plus tard.
                    </span>
                    <span>{draft.biography.length}/2000</span>
                </div>
            </div>
        </section>
    );
}
