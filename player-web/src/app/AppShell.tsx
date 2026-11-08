import type { ComponentChildren } from "preact";
import { useLocation } from "preact-iso";
import { RulesProvider } from "../../../shared/contexts/rules";

import "./app-shell.css";

interface AppShellProps {
    children: ComponentChildren;
}

export function AppShell({ children }: AppShellProps) {
    const location = useLocation();

    return (
        <RulesProvider>
            <div class="app-shell">
                <header class="app-header">
                    <a
                        class="app-brand"
                        href="/"
                        onClick={() => location.route("/")}
                    >
                        <span class="app-brand-icon">⚔</span>
                        <span>Chroniques</span>
                    </a>

                    <nav class="app-navigation">
                        <a
                            href="/"
                            class={location.path === "/" ? "active" : ""}
                        >
                            Personnages
                        </a>

                        <a
                            href="/characters/new"
                            class={
                                location.path === "/characters/new"
                                    ? "active"
                                    : ""
                            }
                        >
                            Créer un personnage
                        </a>
                    </nav>
                </header>

                <main class="app-content">{children}</main>
            </div>
        </RulesProvider>
    );
}
