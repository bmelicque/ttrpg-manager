import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";
import { useContext, useState } from "preact/hooks";

type StartingPoint = "class" | "species";

const steps = [
    { id: "class", label: "Classe" },
    { id: "species", label: "Espèce" },
    { id: "skills", label: "Compétences" },
    { id: "equipment", label: "Équipement" },
    { id: "identity", label: "Identité" },
    { id: "summary", label: "Récapitulatif" },
] as const;

export type StepId = (typeof steps)[number]["id"];
export type Step = (typeof steps)[number];

type StepsContextValue = {
    startingPoint: StartingPoint | null;
    stepIndex: number;
    orderedSteps: readonly Step[];
    currentStep: StepId | null;
    start: (point: StartingPoint) => void;
    goBack: () => void;
    goNext: () => void;
    reset: () => void;
};
export const StepsContext = createContext<StepsContextValue | null>(null);

export function StepsProvider({ children }: PropsWithChildren) {
    const [startingPoint, setStartingPoint] = useState<StartingPoint | null>(
        null,
    );
    const [stepIndex, setStepIndex] = useState(0);

    const orderedSteps =
        startingPoint === "species"
            ? [steps[1], steps[0], ...steps.slice(2)]
            : steps;

    const currentStep: StepId | null =
        startingPoint === null ? null : orderedSteps[stepIndex].id;

    function start(point: StartingPoint) {
        setStartingPoint(point);
        setStepIndex(0);
    }

    function goBack() {
        if (stepIndex === 0) {
            setStartingPoint(null);
            return;
        }

        setStepIndex((index) => index - 1);
    }

    function goNext() {
        setStepIndex((index) => Math.min(index + 1, orderedSteps.length - 1));
    }

    function reset() {
        setStartingPoint(null);
        setStepIndex(0);
    }
    return (
        <StepsContext.Provider
            value={{
                startingPoint,
                stepIndex,
                orderedSteps,
                currentStep,
                start,
                goBack,
                goNext,
                reset,
            }}
        >
            {children}
        </StepsContext.Provider>
    );
}

export function useSteps() {
    const context = useContext(StepsContext);

    if (!context) {
        throw new Error("useSteps doit être utilisé dans StepsProvider");
    }

    return context;
}
