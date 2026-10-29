import { createContext, type ComponentChildren } from "preact";
import { fetchClasses, fetchSublasses } from "../api/rules";
import { useContext, useEffect, useState } from "preact/hooks";
import type { Class } from "../schemas/class";
import type { Subclass } from "../schemas/subclass";

type FetchedData<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

type RulesContextValue = {
    classes: FetchedData<Class[]>;
    subclasses: FetchedData<Subclass[]>;
};

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ComponentChildren }) {
    const classes = useFetch(fetchClasses);
    const subclasses = useFetch(fetchSublasses);

    return (
        <RulesContext.Provider value={{ classes, subclasses }}>
            {children}
        </RulesContext.Provider>
    );
}

function useFetch<T>(fetcher: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async function () {
            try {
                const results = await fetcher();
                if (!cancelled) setData(results);
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

    return { data, loading, error };
}

export function useRules() {
    const context = useContext(RulesContext);

    if (!context) {
        throw new Error("useRules doit être utilisé dans RulesProvider");
    }

    return context;
}
