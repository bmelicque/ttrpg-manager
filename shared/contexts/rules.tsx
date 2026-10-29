import { createContext, type ComponentChildren } from "preact";
import { fetchClasses } from "../../player-web/src/api/rules";
import { useContext, useEffect, useState } from "preact/hooks";
import type { Class } from "../schemas/class";

type RulesContextValue = {
    classes: Class[];
    loading: boolean;
    error: string | null;
};

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ComponentChildren }) {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async function () {
            try {
                const results = await fetchClasses();
                if (!cancelled) setClasses(results);
            } catch (err: unknown) {
                if (!cancelled) {
                    const e =
                        err instanceof Error ? err.message : "Erreur inconnue";
                    setError(e);
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <RulesContext.Provider value={{ classes, loading, error }}>
            {children}
        </RulesContext.Provider>
    );
}

export function useRules() {
    const context = useContext(RulesContext);

    if (!context) {
        throw new Error("useRules doit être utilisé dans RulesProvider");
    }

    return context;
}
