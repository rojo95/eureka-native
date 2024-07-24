import { Batch, Chapter, SubBatch } from "api/budgets/budgets";
import cloneDeep from "lodash.clonedeep";
import { ITEM_TYPES } from "../constants";
import { ShownItem } from "../components/ItemDetails/ItemDetails";
import { Select } from "components/Select/Select";

function handleItem({
    itemBase,
    itemId,
    parent,
    itemsToReplace,
}: {
    itemBase: (Chapter | Batch | SubBatch)[];
    itemId: number;
    parent?: Chapter | Batch;
    itemsToReplace: (Chapter | Batch | SubBatch)[];
}) {
    for (let i = 0; i < itemBase.length; i++) {
        const type = getItemType(itemBase[i]);
        if (itemBase[i].id === itemId) {
            if (type === ITEM_TYPES.CHAPTER) {
                const chapter = itemBase[i] as Chapter;
                chapter.batches = itemsToReplace as Batch[];
                if (itemsToReplace.length > 0) {
                    chapter.totalCost = addUpValues({
                        values: chapter.batches.map((v) => v.totalCost),
                    });
                    chapter.totalSale = addUpValues({
                        values: chapter.batches.map((v) => v.totalSale),
                    });
                } else {
                    chapter.totalCost = 0;
                    chapter.totalSale = 0;
                }

                // Update parent if exists
                if (parent) {
                    updateParent(parent);
                }
            } else if (type === ITEM_TYPES.BATCH) {
                const batch = itemBase[i] as Batch;

                batch.subBatches = itemsToReplace as SubBatch[];
                const quantity = batch.amount;
                if (itemsToReplace.length > 0) {
                    batch.retailPrice = addUpValues({
                        values: batch.subBatches.map(
                            (v) => v.amount * v.retailPrice
                        ),
                    });
                    batch.matCost = addUpValues({
                        values: batch.subBatches.map(
                            (v) => v.amount * v.matCost
                        ),
                    });
                    batch.outsourceCost = addUpValues({
                        values: batch.subBatches.map(
                            (v) => v.amount * v.outsourceCost
                        ),
                    });
                    batch.moCost = addUpValues({
                        values: batch.subBatches.map(
                            (v) => v.amount * v.moCost
                        ),
                    });
                    batch.totalCost =
                        quantity *
                        addUpValues({
                            values: batch.subBatches.map((v) => v.totalCost),
                        });
                } else {
                    batch.totalCost = multiplyValues({
                        values: [batch.saleUd, quantity],
                    });
                }

                // Update parent if exists
                if (parent) {
                    updateParent(parent);
                }
            }

            return true;
        }

        if (type === ITEM_TYPES.CHAPTER) {
            const item = itemBase[i] as Chapter;
            if (
                item.batches &&
                handleItem({
                    itemId,
                    itemBase: item.batches,
                    parent: item,
                    itemsToReplace,
                })
            ) {
                return true;
            }
        }

        if (type === ITEM_TYPES.BATCH) {
            const item = itemBase[i] as Batch;

            if (
                item.subBatches &&
                handleItem({
                    itemId,
                    itemBase: item.subBatches,
                    parent: item,
                    itemsToReplace,
                })
            ) {
                return true;
            }
        }
    }

    return false;
}

function updateParent(parent: Chapter | Batch) {
    const type = getItemType(parent);
    if (type === ITEM_TYPES.CHAPTER) {
        const chapter = parent as Chapter;
        chapter.totalCost = chapter.batches.reduce(
            (acc, batch) => acc + batch.totalCost,
            0
        );
        chapter.totalSale = chapter.batches.reduce(
            (acc, batch) => acc + batch.totalSale,
            0
        );
    } else if (type === ITEM_TYPES.BATCH) {
        const batch = parent as Batch;
        batch.totalCost = batch.subBatches.reduce(
            (acc, subBatch) => acc + subBatch.totalCost,
            0
        );
    }
}

export function updateChapterItems({
    baseChapters,
    parentId,
    itemsToReplace,
}: {
    baseChapters: Chapter[];
    parentId?: number;
    itemsToReplace: (Chapter | Batch | SubBatch)[];
}): Chapter[] {
    // Clone the original array so as not to modify the original array
    const newArray: Chapter[] = cloneDeep(baseChapters);

    if (!parentId) {
        return itemsToReplace as Chapter[];
    }

    handleItem({ itemBase: newArray, itemId: parentId, itemsToReplace });

    return newArray as Chapter[];
}

export function applyPercentage({
    initialValue,
    discounts,
    subtract = true,
}: {
    initialValue: number;
    discounts?: number[];
    subtract?: boolean;
}): number {
    let finalValue = initialValue;
    discounts?.forEach((discount) => {
        finalValue = subtract
            ? (finalValue -= finalValue * (discount / 100))
            : (finalValue += finalValue * (discount / 100));
    });

    return finalValue;
}

export const addUpValues = ({ values }: { values: number[] }) => {
    let finalValue = 0;
    values.forEach((value) => {
        finalValue += value;
    });
    return finalValue || 0;
};

export const multiplyValues = ({ values }: { values: number[] }) => {
    let first: boolean = true;
    let finalValue = 0;
    values.forEach((value) => {
        if (first) {
            finalValue = value;
            first = false;
        } else {
            finalValue = finalValue * value;
        }
    });

    return finalValue || 0;
};

export const calculateRank = (items: (Chapter | Batch | SubBatch)[]) =>
    items.length + 1;

export function calculateUnitaryCost({
    matCost,
    outsourceCost,
    moCost,
}: {
    matCost: number;
    outsourceCost: number;
    moCost: number;
}) {
    return addUpValues({
        values: [matCost, outsourceCost, moCost],
    });
}

/**
 * The function uses a series of conditional statements to determine the
 * type of the item based on the presence of specific properties.
 */
export function getItemType(item: Chapter | Batch | SubBatch): ShownItem {
    if ("kMat" in item) return ITEM_TYPES.CHAPTER;
    if ("chapterId" in item) return ITEM_TYPES.BATCH;
    if ("batchId" in item) return ITEM_TYPES.SUBBATCH;
    throw new Error("Unknown item type");
}

export const calculateSaleUd = ({
    matSale,
    moSale,
    outsourceSale,
    saleDiscount,
}: {
    matSale: number;
    moSale: number;
    outsourceSale: number;
    saleDiscount: number;
}): number => {
    const value = addUpValues({
        values: [matSale, moSale, outsourceSale],
    });

    if (saleDiscount > 0) {
        return applyPercentage({
            initialValue: value,
            discounts: [saleDiscount],
        });
    }

    return value;
};

export function mapDatabasesToSelectOptions(
    databases: { id: number; title: string }[]
): Select[] {
    return databases.map((v) => ({
        id: v.id.toString(),
        description: v.title,
    }));
}
