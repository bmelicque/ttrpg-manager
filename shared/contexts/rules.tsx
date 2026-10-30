import { createContext, type ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { fetchClasses, fetchFeats, fetchSubclasses } from "../api/rules";
import type { Class } from "../schemas/class";
import { type Feat } from "../schemas/feat";
import type { Subclass } from "../schemas/subclass";

type FetchedData<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

type RulesContextValue = {
    classes: FetchedData<Class[]>;
    subclasses: FetchedData<Subclass[]>;
    feats: FetchedData<Feat[]>;
};

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ComponentChildren }) {
    const classes = useFetch(fetchClasses);
    const subclasses = useFetch(fetchSubclasses);
    const feats = useFetch(fetchFeats);

    return (
        <RulesContext.Provider value={{ classes, subclasses, feats }}>
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

        fetcher()
            .then((results) => cancelled || setData(results))
            .catch((err: unknown) => cancelled || setError(errorMessage(err)))
            .finally(() => cancelled || setLoading(false));

        return () => {
            cancelled = true;
        };
    }, []);

    return { data, loading, error };
}

function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : "Erreur inconnue";
}

export function useRules() {
    const context = useContext(RulesContext);

    if (!context) {
        throw new Error("useRules doit être utilisé dans RulesProvider");
    }

    return context;
}
