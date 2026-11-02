import { useDraft } from "../contexts/useDraft";
import { useSteps, type Step } from "../contexts/useSteps";
import { CharacterSummary } from "./CharacterSummary";
import ClassSelection from "./ClassSelection";
import "./creation-page.css";
import EquipmentSelection from "./EquipmentSelection";
import { IdentitySelection } from "./IdentitySelection";
import SkillSelection from "./SkillSelection";
import SpeciesSelection from "./SpeciesSelection";

export default function () {
    const { startingPoint, start } = useSteps();

    return (
        <main class="creation-page">
            <header class="creation-header">
                <p class="eyebrow">CRÉATION DE PERSONNAGE</p>
                <h1>Nouveau personnage</h1>
            </header>

            {startingPoint === null ? <StepZero start={start} /> : <Steps />}
        </main>
    );
}

type StepZeroProps = {
    start: (startingPoint: "class" | "species") => void;
};
function StepZero({ start }: StepZeroProps) {
    return (
        <section class="creation-panel">
            <h2>Tu préfères commencer par...</h2>

            <div class="choice-grid">
                <button onClick={() => start("class")}>
                    <span>
                        <span class="choice-icon">⚔️</span>
                        <strong>La classe</strong>
                    </span>
                    <span>Quel sera ton rôle dans l'aventure ?</span>
                </button>

                <button onClick={() => start("species")}>
                    <span class="choice-icon">🧬</span>
                    <strong>L'espèce</strong>
                    <span>À quel peuple appartiens-tu ?</span>
                </button>
            </div>
        </section>
    );
}

function Steps() {
    const { draft, dispatch } = useDraft();
    const {
        stepIndex,
        currentStep,
        orderedSteps,
        goBack: _goBack,
        goNext,
        reset,
    } = useSteps();
    const canContinue = currentStep !== "class" || draft.classId !== null;
    const currentStepIndex = orderedSteps.findIndex(
        (step) => step.id === currentStep,
    );

    const goBack = () => {
        _goBack();
        if (stepIndex === 0) dispatch({ type: "reset" });
    };

    return (
        <>
            <nav class="step-progress" aria-label="Étapes de création">
                {orderedSteps.map((step, index) => (
                    <StepBadge
                        key={step.id}
                        step={step}
                        index={index}
                        current={currentStepIndex}
                    />
                ))}
            </nav>

            <section class="creation-panel">
                <p class="eyebrow">
                    ÉTAPE {stepIndex + 1} SUR {orderedSteps.length}
                </p>

                <h2>
                    {
                        orderedSteps.find((step) => step.id === currentStep)
                            ?.label
                    }
                </h2>

                {currentStep === "class" && <ClassSelection />}

                {currentStep === "species" && <SpeciesSelection />}

                {currentStep === "skills" && <SkillSelection />}

                {currentStep === "equipment" && <EquipmentSelection />}

                {currentStep === "identity" && <IdentitySelection />}

                {currentStep === "summary" && <CharacterSummary />}

                <div class="step-actions">
                    <button
                        type="button"
                        class="secondary-button"
                        onClick={goBack}
                    >
                        Retour
                    </button>

                    {stepIndex < orderedSteps.length - 1 ? (
                        <button
                            type="button"
                            disabled={!canContinue}
                            onClick={goNext}
                        >
                            Continuer
                        </button>
                    ) : (
                        <button type="button" onClick={reset}>
                            Terminer
                        </button>
                    )}
                </div>
            </section>
        </>
    );
}

type StepBadgeProps = {
    step: Step;
    index: number;
    current: number;
};
function StepBadge({ step, index, current }: StepBadgeProps) {
    const state =
        index === current ? "active" : index < current ? "completed" : "";

    return (
        <div
            key={step.id}
            class={`step ${state}`}
            aria-current={index === current ? "step" : undefined}
        >
            <span class="step-number">{index < current ? "✓" : index + 1}</span>
            <p class="step-label">{step.label}</p>
        </div>
    );
}
