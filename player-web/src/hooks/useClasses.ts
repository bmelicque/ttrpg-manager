import { useEffect, useState } from "preact/hooks";
import { fetchClasses } from "../api/rules";
import type { Class } from "../../../shared/schemas/class";

interface ClassesState {
    classes: Class[];
    loading: boolean;
    error: string | null;
}

export function useClasses(): ClassesState {
    const [state, setState] = useState<ClassesState>({
        classes: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();

        fetchClasses(controller.signal)
            .then((classes) => {
                setState({
                    classes,
                    loading: false,
                    error: null,
                });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;

                setState({
                    classes: [],
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Une erreur inattendue est survenue.",
                });
            });

        return () => controller.abort();
    }, []);

    return state;
}
