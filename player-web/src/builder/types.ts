import type { Feat } from "../../../shared/schemas/feat";

export type ItemProps<Data> = {
    item: Data;
    feats: Feat[];
    isSelected: boolean;
    select: () => void;
};
