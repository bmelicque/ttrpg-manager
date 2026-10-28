import type { ComponentChildren } from "preact";

export type Page = "dashboard" | "campaigns" | "characters" | "maps";

interface AppLayoutProps {
    page: Page;
    onNavigate: (page: Page) => void;
    children: ComponentChildren;
}

const navigation: { id: Page; label: string; icon: string }[] = [
    { id: "dashboard", label: "Aperçu", icon: "⌂" },
    { id: "campaigns", label: "Campagnes", icon: "▤" },
    { id: "characters", label: "Personnages", icon: "♙" },
    { id: "maps", label: "Cartes", icon: "▦" },
];

export function AppLayout({ page, onNavigate, children }: AppLayoutProps) {
    return (
        <div class="app-shell">
            <aside class="sidebar">
                <div class="brand">
                    <div class="brand-mark">⚔</div>
                    <div>
                        <strong>Chronicle</strong>
                        <span>Gestionnaire de campagne</span>
                    </div>
                </div>

                <div class="nav-heading">ESPACE DE TRAVAIL</div>

                <nav aria-label="Main navigation">
                    {navigation.map((item) => (
                        <button
                            key={item.id}
                            class={`nav-item ${page === item.id ? "active" : ""}`}
                            aria-current={page === item.id ? "page" : undefined}
                            onClick={() => onNavigate(item.id)}
                        >
                            <span class="nav-icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div class="sidebar-footer">
                    <span class="status-dot" />
                    <span>Espace local</span>
                </div>
            </aside>

            <main class="main-content">
                <header class="topbar">
                    <span class="breadcrumb">
                        Espace de travail /{" "}
                        {navigation.find((item) => item.id === page)?.label}
                    </span>
                    <span class="local-badge">Mode hors-ligne prêt</span>
                </header>

                <section class="page-content">{children}</section>
            </main>
        </div>
    );
}
