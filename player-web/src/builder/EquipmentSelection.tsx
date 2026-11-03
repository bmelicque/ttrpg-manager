import type { Dispatch } from "preact/hooks";
import { useRules } from "../../../shared/contexts/rules";
import { formatMoney } from "../../../shared/rules/money";
import type { EquipmentKit } from "../../../shared/schemas/equipment-kit";
import type { InventoryEntry } from "../../../shared/schemas/inventory";
import type { Item } from "../../../shared/schemas/item";
import {
    computeRemainingBudget,
    STARTING_EQUIPMENT_BUDGET,
    useDraft,
    type DraftAction,
} from "../contexts/useDraft";
import { useSteps } from "../contexts/useSteps";

export default function EquipmentSelection() {
    const { items: _items, equipmentKits: _equipmentKits } = useRules();
    const items = _items.data;
    const kits = _equipmentKits.data ?? [];
    const loading = _items.loading || _equipmentKits.loading;
    const error = _items.error || _equipmentKits.error;
    const { draft, dispatch } = useDraft();
    const weapons = useWeapons(items ?? []);
    if (loading) return <p role="status">Chargement des objets…</p>;
    if (error)
        return <p role="alert">Impossible de charger les objets : {error}</p>;
    if (!items?.length) return <p>Aucun objet disponible pour le moment.</p>;

    const inventory = draft.equipment.inventory;
    const remainingBudget = computeRemainingBudget(inventory, items);

    const armors = items.filter((item) => item.kind.type === "armor");
    const otherItems = items.filter(
        (item) => item.kind.type === "gear" || item.kind.type === "consumable",
    );

    return (
        <div class="equipment-selection">
            <header class="equipment-budget">
                <div>
                    <span>Budget restant</span>
                    <strong>{formatMoney(remainingBudget)}</strong>
                </div>
                <div>
                    <span>Budget initial</span>
                    <strong>{formatMoney(STARTING_EQUIPMENT_BUDGET)}</strong>
                </div>
            </header>

            <QuickBuild />

            <EquipmentSection
                title="Armes"
                sectionItems={weapons}
                inventory={inventory}
                remainingBudget={remainingBudget}
                dispatch={dispatch}
            />
            <EquipmentSection
                title="Armures"
                sectionItems={armors}
                inventory={inventory}
                remainingBudget={remainingBudget}
                dispatch={dispatch}
            />
            <section class="equipment-section">
                <h3>Autres équipements</h3>

                {kits.length > 0 && (
                    <div class="equipment-kits">
                        <h4>Kits d'aventurier</h4>

                        {kits.map((kit) => (
                            <KitView
                                kit={kit}
                                items={items}
                                remainingBudget={remainingBudget}
                                dispatch={dispatch}
                            />
                        ))}
                    </div>
                )}

                <EquipmentSection
                    title="Objets individuels"
                    sectionItems={otherItems}
                    inventory={inventory}
                    remainingBudget={remainingBudget}
                    dispatch={dispatch}
                />
            </section>
        </div>
    );
}

function useWeapons(items: Item[]): Item[] {
    const classes = useRules().classes.data ?? [];
    const { draft } = useDraft();
    const class_ = classes.find((c) => c.id === draft.classId);
    if (!class_) return [];
    const proficiencies = class_.proficiencies.weapons.map((w) => w.id);
    return items.filter(
        (item) =>
            item.kind.type === "weapon" &&
            proficiencies.includes(item.kind.categoryId),
    );
}

function QuickBuild() {
    const { classes } = useRules();
    const { draft, dispatch } = useDraft();
    const { goNext } = useSteps();
    const selectedClass = classes.data?.find((c) => c.id === draft.classId);
    const suggestion = selectedClass?.equipmentSuggestions;
    if (!suggestion?.length) return <></>;
    const onClick = () => {
        dispatch({
            type: "add-inventory-entries",
            entries: suggestion.map((s) => ({
                id: crypto.randomUUID(),
                itemId: s,
                quantity: 1,
            })),
        });
        goNext();
    };
    return (
        <div className="equipment-quick">
            <p>Pas envie de réflechir&nbsp;? </p>
            <button onClick={onClick}>Prendre le kit par défaut</button>
        </div>
    );
}

type EquipementSectionProps = {
    title: string;
    sectionItems: Item[];
    inventory: InventoryEntry[];
    remainingBudget: number;
    dispatch: Dispatch<DraftAction>;
};
function EquipmentSection(props: EquipementSectionProps) {
    if (props.sectionItems.length === 0) return <></>;

    return (
        <section class="equipment-section">
            <h3>{props.title}</h3>

            <div class="equipment-item-list">
                {props.sectionItems.map((item) => (
                    <ItemView
                        item={item}
                        inventory={props.inventory}
                        remainingBudget={props.remainingBudget}
                        dispatch={props.dispatch}
                    />
                ))}
            </div>

            {props.title === "Armures" && (
                <small>
                    Si la Force requise n'est pas atteinte, un malus s'applique
                    aux tests liés à la Force ou à la Dextérité.
                </small>
            )}
        </section>
    );
}

type ItemViewProps = {
    item: Item;
    inventory: InventoryEntry[];
    remainingBudget: number;
    dispatch: Dispatch<DraftAction>;
};
function ItemView(props: ItemViewProps) {
    const { item, inventory, remainingBudget, dispatch } = props;
    const addItem = (item: Item) => {
        if (item.price > remainingBudget) return;

        const entry: InventoryEntry = {
            id: crypto.randomUUID(),
            itemId: item.id,
            quantity: 1,
        };

        dispatch({ type: "add-inventory-entry", entry });
    };

    const removeItem = (itemId: string) => {
        const entry = inventory.find((entry) => entry.itemId === itemId);
        if (!entry) return;

        if (entry.quantity > 1) {
            dispatch({
                type: "set-inventory-quantity",
                entryId: entry.id,
                quantity: entry.quantity - 1,
            });
        } else {
            dispatch({
                type: "remove-inventory-entry",
                entryId: entry.id,
            });
        }
    };

    const quantity = getQuantity(item.id, inventory);
    const canAfford = item.price <= remainingBudget;

    return (
        <article class="equipment-item" key={item.id}>
            <div class="equipment-item-info">
                <div class="equipment-item-title">
                    <strong>{item.name}</strong>
                </div>
                <div className="equipment-item-data">
                    {item.kind.type === "weapon" && (
                        <span>
                            <strong>Mains&nbsp;:</strong>{" "}
                            {item.kind.handsRequired}
                            &nbsp;;
                        </span>
                    )}
                    {item.kind.type === "armor" && (
                        <>
                            <span>
                                <strong>Bonus de CA&nbsp;:</strong> +
                                {item.kind.acBonus}
                                &nbsp;;
                            </span>
                            <span>
                                <strong>Limite de dextérité&nbsp;:</strong> +
                                {item.kind.dexCap}
                                &nbsp;;
                            </span>
                            <span>
                                <strong>Force requise&nbsp;:</strong> +
                                {item.kind.strReq}
                                &nbsp;;
                            </span>
                        </>
                    )}

                    <span>
                        <strong>Prix&nbsp;:</strong> {formatMoney(item.price)}
                    </span>
                </div>

                {item.description && <p>{item.description}</p>}
            </div>

            <div class="equipment-item-actions">
                {quantity > 0 && (
                    <>
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Retirer ${item.name}`}
                        >
                            −
                        </button>
                        <span>{quantity}</span>
                    </>
                )}

                <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => addItem(item)}
                >
                    Ajouter
                </button>
            </div>
        </article>
    );
}

function getQuantity(itemId: string, inventory: InventoryEntry[]) {
    return inventory
        .filter((entry) => entry.itemId === itemId)
        .reduce((total, entry) => total + entry.quantity, 0);
}

function KitView(props: {
    kit: EquipmentKit;
    items: Item[];
    remainingBudget: number;
    dispatch: Dispatch<DraftAction>;
}) {
    const { kit, items, remainingBudget, dispatch } = props;

    const getItem = (itemId: string) =>
        items.find((item) => item.id === itemId);

    const addKit = (kit: EquipmentKit) => {
        const entries: InventoryEntry[] = kit.items.map(
            ({ itemId, quantity }) => ({
                id: crypto.randomUUID(),
                itemId,
                quantity,
            }),
        );

        const kitCost = entries.reduce((total, entry) => {
            const item = getItem(entry.itemId);
            if (!item) throw new Error(`Objet introuvable : ${entry.itemId}`);
            return total + item.price * entry.quantity;
        }, 0);

        if (kitCost > remainingBudget) return;

        dispatch({
            type: "add-inventory-entries",
            entries,
        });
    };

    const cost = kit.items.reduce((total, entry) => {
        const item = getItem(entry.itemId);
        return total + (item?.price ?? 0) * entry.quantity;
    }, 0);

    return (
        <article class="equipment-kit" key={kit.id}>
            <div>
                <strong>{kit.name}</strong>
                <p>{kit.description}</p>
                <span>{cost} po</span>
            </div>

            <button
                type="button"
                disabled={cost > remainingBudget}
                onClick={() => addKit(kit)}
            >
                Ajouter le kit
            </button>
        </article>
    );
}
