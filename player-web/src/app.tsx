import { RulesProvider } from "../../shared/contexts/rules";
import "../../shared/styles/base.css";
import "../../shared/styles/buttons.css";
import "../../shared/styles/forms.css";
import Builder from "./pages/CharacterCreationPage";
import { CharacterDraftProvider } from "./contexts/useDraft";
import { StepsProvider } from "./contexts/useSteps";

export function App() {
    return (
        <RulesProvider>
            <CharacterDraftProvider>
                <StepsProvider>
                    <Builder />
                </StepsProvider>
            </CharacterDraftProvider>
        </RulesProvider>
    );
}
