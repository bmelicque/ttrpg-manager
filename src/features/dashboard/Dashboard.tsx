import type { Page } from "../../components/Layout";

interface DashboardProps {
    onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
    return (
        <div class="dashboard">
            <div class="page-heading">
                <div>
                    <p class="eyebrow">VOTRE ESPACE DE TRAVAIL</p>
                    <h1>Vos aventures</h1>
                    <p class="muted">
                        Tout ce dont vous avez besoin pour votre prochaine
                        session.
                    </p>
                </div>
            </div>

            <div class="welcome-panel">
                <div>
                    <p class="eyebrow">PROCHAIN CHAPITRE</p>
                    <h2>Votre prochaine aventure commence ici.</h2>
                    <p class="muted">
                        Créez une campagne, construisez votre monde, et
                        rassemblez vos joueurs.
                    </p>
                    <button
                        class="primary-button"
                        onClick={() => onNavigate("campaigns")}
                    >
                        Explorer les campagnes →
                    </button>
                </div>
                <div class="welcome-symbol" aria-hidden="true">
                    ✧
                </div>
            </div>

            <div class="section-heading">
                <h2>Espace de travail</h2>
            </div>

            <div class="feature-grid">
                <button
                    class="feature-card"
                    onClick={() => onNavigate("campaigns")}
                >
                    <span class="feature-icon">▤</span>
                    <h3>Campagnes</h3>
                    <p>Organisez vos aventures, notes, et PNJ.</p>
                    <span class="card-action">Voir les campagnes →</span>
                </button>

                <button
                    class="feature-card"
                    onClick={() => onNavigate("characters")}
                >
                    <span class="feature-icon">♙</span>
                    <h3>Personnages</h3>
                    <p>Créez et gérez vos personnages joueurs.</p>
                    <span class="card-action">Voir les personnages →</span>
                </button>

                <button class="feature-card" onClick={() => onNavigate("maps")}>
                    <span class="feature-icon">▦</span>
                    <h3>Cartes de combat</h3>
                    <p>Préparez vos cartes et placez vos pions.</p>
                    <span class="card-action">Ouvrir les cartes →</span>
                </button>
            </div>
        </div>
    );
}
