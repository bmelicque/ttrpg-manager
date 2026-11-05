import { postCharacter } from "../api/characters";
import { useDraft } from "../contexts/useDraft";
import { useSteps, type Step } from "../contexts/useSteps";
import { CharacterSummary } from "./CharacterSummary";
import ClassSelection from "./ClassSelection";
import "./creation-page.css";
import EquipmentSelection from "./EquipmentSelection";
import { IdentitySelection } from "./IdentitySelection";
import SkillSelection from "./SkillSelection";
import SpeciesSelection from "./SpeciesSelection";
import { useAttributes } from "./useAttributes";

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
            <h2>Commencer par...</h2>

            <div class="choice-grid">
                <FirstChoiceOption
                    icon="⚔️"
                    label="La classe"
                    description="Quel sera ton rôle dans l'aventure ?"
                    onClick={() => start("class")}
                />
                <FirstChoiceOption
                    icon="🧬"
                    label="L'espèce"
                    description="À quel peuple appartiens-tu ?"
                    onClick={() => start("species")}
                />
            </div>
        </section>
    );
}

type FirstChoiceOptionProps = {
    onClick: () => void;
    icon: string;
    label: string;
    description: string;
};
function FirstChoiceOption(props: FirstChoiceOptionProps) {
    return (
        <button onClick={props.onClick}>
            <span class="choice-header">
                <span class="choice-icon">{props.icon}</span>
                <strong>{props.label}</strong>
            </span>
            <span>{props.description}</span>
        </button>
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
    const attributes = useAttributes();
    const canContinue = currentStep !== "class" || draft.classId !== null;
    const currentStepIndex = orderedSteps.findIndex(
        (step) => step.id === currentStep,
    );

    const goBack = () => {
        _goBack();
        if (stepIndex === 0) dispatch({ type: "reset" });
    };

    const post = () => {
        if (!attributes) return;
        postCharacter(draft, attributes)
            .then(() => reset())
            .catch((e) => console.log(e));
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
                        <button type="button" onClick={post}>
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
