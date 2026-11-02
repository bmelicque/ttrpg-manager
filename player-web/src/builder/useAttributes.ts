import { useRules } from "../../../shared/contexts/rules";
import { getSelectedClass, useDraft } from "../contexts/useDraft";

export function useAttributes() {
    const classes = useRules().classes.data;
    const { draft } = useDraft();
    const class_ = getSelectedClass(draft, classes);
    return class_?.attributes;
}
