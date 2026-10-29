import z from "zod";
import { classSchema, type Class } from "../../../shared/schemas/class";

export interface SubclassOption {
    id: string;
    name: string;
    description: string;
}

export interface ClassOption {
    id: string;
    name: string;
    description: string;
    role: string;
    subclasses: SubclassOption[];
}

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
