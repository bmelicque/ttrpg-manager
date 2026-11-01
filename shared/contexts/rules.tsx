import { createContext, type ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import {
    fetchClasses,
    fetchEquipmentKits,
    fetchFeats,
    fetchHeritages,
    fetchItems,
    fetchSpecies,
    fetchSubclasses,
} from "../api/rules";
import type { Class } from "../schemas/class";
import type { EquipmentKit } from "../schemas/equipment-kit";
import type { Feat } from "../schemas/feat";
import type { Heritage } from "../schemas/heritage";
import type { Item } from "../schemas/item";
import type { Species } from "../schemas/species";
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
    species: FetchedData<Species[]>;
    heritages: FetchedData<Heritage[]>;
    items: FetchedData<Item[]>;
    equipmentKits: FetchedData<EquipmentKit[]>;
};

const RulesContext = createContext<RulesContextValue | null>(null);

export function RulesProvider({ children }: { children: ComponentChildren }) {
    const classes = useFetch(fetchClasses);
    const subclasses = useFetch(fetchSubclasses);
    const feats = useFetch(fetchFeats);
    const species = useFetch(fetchSpecies);
    const heritages = useFetch(fetchHeritages);
    const items = useFetch(fetchItems);
    const equipmentKits = useFetch(fetchEquipmentKits);

    return (
        <RulesContext.Provider
            value={{
                classes,
                subclasses,
                feats,
                species,
                heritages,
                items,
                equipmentKits,
            }}
        >
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
