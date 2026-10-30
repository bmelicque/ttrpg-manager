import z from "zod";
import { classSchema } from "../schemas/class";
import { featSchema } from "../schemas/feat";
import { heritageSchema } from "../schemas/heritage";
import { speciesSchema } from "../schemas/species";
import { subclassSchema } from "../schemas/subclass";

const API_URL = `http://${window.location.hostname}:3001`;

export const fetchClasses = makeFetcher(
    `${API_URL}/api/rules/classes`,
    classSchema,
);

export const fetchSubclasses = makeFetcher(
    `${API_URL}/api/rules/subclasses`,
    subclassSchema,
);

export const fetchFeats = makeFetcher(`${API_URL}/api/rules/feats`, featSchema);

export const fetchSpecies = makeFetcher(
    `${API_URL}/api/rules/species`,
    speciesSchema,
);

export const fetchHeritages = makeFetcher(
    `${API_URL}/api/rules/heritages`,
    heritageSchema,
);

function makeFetcher<T extends z.ZodType>(url: string, schema: T) {
    return async function (signal?: AbortSignal): Promise<z.infer<T>[]> {
        const response = await fetch(url, { signal });

        if (!response.ok) {
            throw new Error(
                `Impossible de charger la ressource (${response.status})`,
            );
        }

        const raw = await response.json();
        return z.array(schema).parse(raw);
    };
}
