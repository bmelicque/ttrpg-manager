import z from "zod";
import { classSchema, type Class } from "../schemas/class";
import { subclassSchema, type Subclass } from "../schemas/subclass";
import { type Feat, featSchema } from "../schemas/feat";

const API_URL = `http://${window.location.hostname}:3001`;

export async function fetchClasses(signal?: AbortSignal): Promise<Class[]> {
    const response = await fetch(`${API_URL}/api/rules/classes`, {
        signal,
    });

    if (!response.ok) {
        throw new Error(
            `Impossible de charger les classes (${response.status})`,
        );
    }

    const raw = await response.json();
    return z.array(classSchema).parse(raw);
}

export async function fetchSubclasses(
    signal?: AbortSignal,
): Promise<Subclass[]> {
    const response = await fetch(`${API_URL}/api/rules/subclasses`, {
        signal,
    });

    if (!response.ok) {
        throw new Error(
            `Impossible de charger les sous-classes (${response.status})`,
        );
    }

    const raw = await response.json();
    return z.array(subclassSchema).parse(raw);
}

export async function fetchFeats(signal?: AbortSignal): Promise<Feat[]> {
    const response = await fetch(`${API_URL}/api/rules/feats`, {
        signal,
    });

    if (!response.ok) {
        throw new Error(`Impossible de charger les dons (${response.status})`);
    }

    const raw = await response.json();
    return z.array(featSchema).parse(raw);
}
