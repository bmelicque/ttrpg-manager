import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";

import { AppShell } from "./AppShell";
import { CharacterListPage } from "../pages/CharacterListPage";
import { CharacterSheetPage } from "../pages/CharacterSheetPage";
import CharacterCreationPage from "../pages/CharacterCreationPage";

export function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <AppShell>
                    <Router>
                        <Route path="/" component={CharacterListPage} />
                        <Route
                            path="/characters/new"
                            component={CharacterCreationPage}
                        />
                        <Route
                            path="/characters/:id"
                            component={CharacterSheetPage}
                        />
                    </Router>
                </AppShell>
            </ErrorBoundary>
        </LocationProvider>
    );
}
