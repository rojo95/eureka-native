import React, { useContext, useEffect, useState, Suspense, lazy } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import cloneDeep from "lodash.clonedeep";
import {
    ActivityIndicator,
    DefaultTheme,
    FAB as FABBase,
    useTheme,
} from "react-native-paper";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";

import AppHeader, { HeaderActions } from "components/AppHeader/AppHeader";
import { ActionProps } from "components/FAB/FAB";
import {
    Batch,
    Budget,
    Chapter,
    deleteBatch,
    deleteChapter,
    deleteSubBatch,
    SubBatch,
    updateBudget,
} from "api/budgets/budgets";
import ItemCard from "./components/ItemCard/ItemCard";
import { ParamsContext } from "contexts/SharedParamsProvider";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import Modal from "components/Modal/Modal";
import Text from "components/Text/Text";
import Button, { BUTTON_TYPES } from "components/Button/Button";
import { BUDGET_STATES, FORM_TYPES, ITEM_TYPES } from "./constants";
import { confirmAlert } from "utils/functions";
import { getItemType, updateChapterItems } from "./utils/utils";
import ItemDetails, { ShownItem } from "./components/ItemDetails/ItemDetails";
import ChapterForm from "./components/ChapterForm/ChapterForm";
import BatchForm from "./components/BatchForm/BatchForm";
import SubBatchForm from "./components/SubBatchForm/SubBatchForm";
import ImportExportModal, { Transaction, TRANSACTION_TYPES } from "./components/ImportExportModal/ImportExportModal";

type ItemDetailsParams = {
    type?: ShownItem;
    kMat?: number;
    kOut?: number;
    kMo?: number;
    id?: number;
    path?: { id: number; rank: number }[];
    description?: string;
    subBatch?: Chapter[];
    batches?: Batch[];
    code?: string | null | undefined;
    imageUrl?: string | null | undefined;
    saleDiscount?: number;
    coefficient?: number;
};

type BaseItemResult<T> = T & {
    type: ShownItem;
};

interface ItemResultBatch extends BaseItemResult<Batch> {}
interface ItemResultSubBatch extends BaseItemResult<SubBatch> {}
interface ItemResultChapter extends BaseItemResult<Chapter> {}

type ItemResult = ItemResultBatch | ItemResultSubBatch | ItemResultChapter;

export default function Chapters() {
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();
    const { width, height } = useWindowDimensions();
    const {
        contextParams: {
            budgetId,
            chapters: baseChaptersContext,
            budgetState,
            currentBudget,
        },
        setContextParams,
    } = useContext(ParamsContext)!;
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);
    const [edition, setEdition] = useState<boolean>(false);
    const [chapters, setChapters] = useState<(Chapter | Batch | SubBatch)[] | null | undefined>(baseChaptersContext!);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [actions, setActions] = useState<ActionProps[] | null>(null);
    const [modalInfo, setModalInfo] = useState<{
        item?: Chapter | Batch | SubBatch;
    } | null>(null);
    const [changed, setChanged] = useState<boolean>(false);
    const [chapterResult, setChapterResult] = useState<ItemResult | null>(null);
    const [itemDetails, setItemDetails] = useState<ItemDetailsParams | null>(
        null
    );
    const [refresh, setRefresh] = useState<boolean>(true);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [exportModal, setExportModal] = useState<{status: boolean, type: Transaction | undefined}>({status: false, type: undefined })

    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.primaryContrast,
        },
        content: {
            flexDirection: height > width ? "column" : "row",
        },
        listContainer: {
            width: "100%",
            paddingBottom: width < height ? 180 : 130,
        }, 
        modal: {
            ...(width > height && { margin: 30 }) 
        }
    });

    /**
     * Fetches chapters data when the component mounts or when the budget ID or base chapters change.
     */
    useEffect(() => {
        if (refresh) {
            setLoading(true);
            setChapters(baseChaptersContext!);
            setItemDetails(null);
            if (baseChaptersContext) {
                setLoading(false);
            }
        }
        setRefresh(true);
    }, [budgetId, baseChaptersContext]);

    /**
     * hook to check if the user has left the view
     */
    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            if (updating) {
                navigation.navigate("budget-chapter");
                return;
            }

            if (!changed) {
                setChapters(baseChaptersContext!);
                setItemDetails(null);
                setSelectedItems([]);
                setEdition(false);
                return;
            }

            handleConfirmAlert({
                title: t("changes-unsaving-title"),
                msg: t("changes-unsaving-description"),
                onCancel: () => navigation.navigate("budget-chapter"),
                onAccept: () => {
                    setChapters(baseChaptersContext!);
                    setChanged(false);
                    setSelectedItems([]);
                    setEdition(false);
                },
            });
        });

        return unsubscribe;
    }, [navigation, changed, updating, baseChaptersContext]);


    async function deleteItems({
        itemsId,
        type,
    }: {
        itemsId: number[];
        type: ShownItem;
    }) {
        const notification = notificationToast({
            text: t("saving"),
        });
        try {
            setLoading(true);
            for (const itemId of itemsId) {
                await (type === ITEM_TYPES.CHAPTER ? 
                    deleteChapter({ chapterId: itemId }) :
                    type === ITEM_TYPES.BATCH ? 
                        deleteBatch({ batchId: itemId }) :
                        deleteSubBatch({ subBatchId: itemId })
                );
            }
            
            setRefresh(false);
            const newChapters = chapters
                ?.filter((chapter) => !itemsId.includes(chapter.id))
                .map((chapter, index) => ({
                    ...chapter,
                    rank: index + 1,
                }));

            if(itemDetails) {
                if (type === ITEM_TYPES.CHAPTER){
                    setItemDetails(prev => ({...prev, chapters: newChapters as Chapter[]}))
                } else if (type === ITEM_TYPES.BATCH){
                    setItemDetails(prev => ({...prev, batches:newChapters as Batch[]}))
                } else if (type === ITEM_TYPES.SUBBATCH){
                    setItemDetails(prev => ({...prev, subBatches: newChapters as SubBatch[]}))
                }
            }

            setChapters(newChapters);

            const newData: Chapter[] = updateChapterItems({
                baseChapters: baseChaptersContext!,
                parentId: itemDetails?.id,
                itemsToReplace: newChapters || [],
            });

            let budget: Budget | undefined = undefined;

            setContextParams((prev) => ({
                ...prev,
                chapters: newData,
            }));

            budget = {
                ...currentBudget!,
                chapters: newData,
            };

            if (budget) {
                (async () => {
                    await saveChanges(budget);
                })();
            }

            notificationToast({
                text: t("chapter-deleted-successfuly"),
                type: NOTIFICATION_TYPES.SUCCESS,
            });
        } catch (err) {
            console.error(err);
            notificationToast({
                text: t("error-deleting-chapter"),
                type: NOTIFICATION_TYPES.DANGER,
            });
        } finally {
            setLoading(false);
            Toast.hide(notification);
        }
    }

    /**
     * validate unsaved data
     */
    const handleUnsavedChanges = (onAcceptCallback: () => void) => {
        if (changed) {
            handleConfirmAlert({
                title: t("changes-unsaving-title"),
                msg: t("changes-unsaving-description"),
                onAccept: () => {
                    setChapters(baseChaptersContext!);
                    setChanged(false);
                    onAcceptCallback();
                },
            });
        } else {
            onAcceptCallback();
        }
    };

    /**
     * management of the chapter list when creating/updating a chapter
     */
    useEffect(() => {
        if (!chapterResult) return;

        const { type } = chapterResult;

        setRefresh(false);

        if (type === ITEM_TYPES.CHAPTER) {
            updateItems({
                chapterResult: chapterResult,
                chapters: chapters as Chapter[],
            });
        } else if (type === ITEM_TYPES.BATCH) {
            const result = chapterResult as Batch;
            const chapterId = result.chapterId;
            updateItems({
                chapters: chapters as Batch[],
                parentId: chapterId,
                chapterResult: chapterResult,
            });
            setItemDetails((prev) => {
                const { batches } = prev as Chapter;
                const updatedBatches = cloneDeep(batches);
                const index = updatedBatches.findIndex(
                    (v) => v.id === chapterResult.id
                );

                if (index === -1) {
                    updatedBatches.push(result);
                } else {
                    updatedBatches[index] = result;
                }
                return { ...prev, batches: updatedBatches };
            });
        } else if (type === ITEM_TYPES.SUBBATCH) {
            const result = chapterResult as SubBatch;
            const batchId = result.batchId;
            updateItems({
                chapters: chapters as SubBatch[],
                parentId: batchId,
                chapterResult,
            });
            setItemDetails((prev) => {
                const { subBatches } = prev as Batch;
                const updatedSubBatches = cloneDeep(subBatches);
                const index = updatedSubBatches.findIndex(
                    (v) => v.id === chapterResult.id
                );

                if (index === -1) {
                    updatedSubBatches.push(result);
                } else {
                    updatedSubBatches[index] = result;
                }

                return { ...prev, subBatches: updatedSubBatches };
            });
        }

        setChapterResult(null);
        setShowModal(false);
    }, [chapterResult, chapters, modalInfo]);

    const updateItems = ({
        chapterResult,
        chapters,
        parentId
    }: {
        chapterResult: Chapter | Batch | SubBatch;
        parentId?: number;
        chapters: (Chapter | Batch | SubBatch)[];
    }) => {
        const newChapters = (chapters || []).map((chapter) =>
            chapter.id === chapterResult.id ? chapterResult : chapter
        );

        if (!newChapters.includes(chapterResult)) {
            newChapters.push(chapterResult);
        }

        const newChaptersData = updateChapterItems({
            parentId: parentId,
            baseChapters: baseChaptersContext!,
            itemsToReplace: newChapters,
        });

        setChapters(newChapters);

        setContextParams((prev) => ({
            ...prev,
            chapters: newChaptersData as Chapter[],
        }));

        saveChanges({ ...currentBudget!, chapters: newChaptersData as Chapter[] });
    };

    /**
     * function to set the actions function
     */
    function updateActions() {
        const actionsBase: any[] = [
            ...[
                budgetState?.id === BUDGET_STATES.PROGRESS &&
                    edition && {
                    icon: "content-save",
                    label: t("save-label"),
                    onPress: async () => await handleSaveChanges(),
                },
            ],
            ...[
                budgetState?.id === BUDGET_STATES.PROGRESS &&
                    !edition &&
                    (!itemDetails ||
                        itemDetails.type === ITEM_TYPES.BATCH ||
                        itemDetails.type === ITEM_TYPES.CHAPTER) && {
                    icon: "plus",
                    label: t("add-new"),
                    onPress: () =>
                        handleUnsavedChanges(() =>
                            openForm({
                                typeForm: FORM_TYPES.CREATE,
                            })
                        ),
                },
            ],
            ...[currentBudget?.state?.id === 1 && 
                {
                    icon: "download",
                    label: t("export-chapter-s"),
                    onPress: () =>
                        handleUnsavedChanges(() =>
                            setExportModal((prev) => ({...prev, status: true, type: TRANSACTION_TYPES.EXPORT}))
                        ),
                },
            ],
            {
                icon: "upload",
                label: t("import-chapter-s"),
                onPress: () =>
                    handleUnsavedChanges(() =>
                        setExportModal((prev) => ({...prev, status: true, type: TRANSACTION_TYPES.IMPORT}))
                    ),
            },
            ...[
                budgetState?.id === BUDGET_STATES.PROGRESS &&
                    edition && {
                    icon: "trash-can",
                    label: `${t("delete-item-label")}(s)`,
                    onPress: () =>
                        handleUnsavedChanges(() =>
                            handleDeleteMultipleItems()
                        ),
                    color: theme.colors.primaryContrast,
                    backgroundColor: theme.colors.dangerIntense,
                },
            ],
        ].filter(Boolean);

        setActions(actionsBase);
    }
    useEffect(() => {
        updateActions();
    }, [budgetState, edition, changed, itemDetails, selectedItems]);

    /**
     * lazy load a FAB Button
     */
    const FAB = () => {
        const LazyFAB = lazy(() => import("components/FAB/FAB"));
        return (
            <Suspense
                fallback={
                    <FABBase
                        style={{
                            position: "absolute",
                            margin: 16,
                            right: 0,
                            bottom: 0,
                            backgroundColor: theme.colors.primary,
                        }}
                        color={theme.colors.primaryContrast}
                        icon="plus"
                        onPress={() => {}}
                    />
                }
            >
                {actions && (
                    <View style={{ position: "absolute", bottom: 0, right: 0 }}>
                        <LazyFAB actions={actions} />
                    </View>
                )}
            </Suspense>
        );
    };

    function handleListUpdate(items: (Chapter | Batch | SubBatch)[]) {
        const settedList = items?.map((v, k) => {
            return { ...v, rank: k + 1 };
        });
        setChapters(settedList);
    }

    function openForm({
        typeForm,
        item,
    }: {
        typeForm: (typeof FORM_TYPES)[keyof typeof FORM_TYPES];
        item?: Chapter | Batch | SubBatch;
    }) {
        if (typeForm === FORM_TYPES.CREATE) {
            setModalInfo({
                item: undefined,
            });
        } else {
            setModalInfo({
                item,
            });
        }
        setShowModal(true);
    }

    async function saveChanges(budget: Budget) {
        await updateBudget({
            budgetId: budgetId!,
            budget: budget,
        }).catch((err) => {
            throw err;
        });
    }

    async function handleSaveChanges() {
        if (budgetState?.id !== BUDGET_STATES.PROGRESS && updating) return;
        setEdition(false);
        setLoading(true);
        setUpdating(true);

        const notification = notificationToast({
            text: t("saving"),
        });

        async function save(chapters: Chapter[]) {
            try {
                const newBudgetValues: Budget = {
                    ...currentBudget!,
                    chapters: chapters!,
                };
                await saveChanges(newBudgetValues);
                setContextParams((prev) => ({ ...prev, chapters: chapters }));
                notificationToast({
                    text: t("updated-chapters"),
                    type: NOTIFICATION_TYPES.SUCCESS,
                });
            } catch (err) {
                console.error(err);
                notificationToast({
                    text: t("error-updating-chapters"),
                    type: NOTIFICATION_TYPES.DANGER,
                });
            } finally {
                Toast.hide(notification);
                setChanged(false);
                setUpdating(false);
                setLoading(false);
            }
        }

        if (!itemDetails) {
            await save(chapters as Chapter[]);
        } else {
            const chapterId =
                itemDetails?.path![itemDetails?.path?.length! - 1]?.id;

            const newChapters = updateChapterItems({
                parentId: chapterId,
                baseChapters: baseChaptersContext!,
                itemsToReplace: chapters!,
            });

            Toast.hide(notification);
            setChanged(false);
            setUpdating(false);
            setLoading(false);
            setRefresh(false);
            save(newChapters);
        }
    }

    function handleItemSelection(itemId: number) {
        setSelectedItems((prev) => {
            if (prev.indexOf(itemId) === -1) {
                prev.push(itemId);
            } else {
                prev = prev.filter((num) => num !== itemId);
            }

            return prev;
        });
    }

    async function handleDeleteMultipleItems() {
        if (selectedItems.length > 0) {
            handleConfirmAlert({
                title: t("want-delete-records"),
                onAccept: async () => {
                    const typeItems =
                        itemDetails?.type === ITEM_TYPES.CHAPTER
                            ? ITEM_TYPES.BATCH
                            : itemDetails?.type === ITEM_TYPES.BATCH
                                ? ITEM_TYPES.SUBBATCH
                                : ITEM_TYPES.CHAPTER;

                    await deleteItems({ itemsId: selectedItems, type: typeItems });
                    setSelectedItems([]);
                    setEdition(false);
                },
            });
        } else {
            notificationToast({
                text: t("must-select-items-delete"),
                type: NOTIFICATION_TYPES.DANGER,
            });
        }
    }

    const handleConfirmAlert = ({
        title,
        msg = "",
        onCancel,
        onAccept,
    }: {
        title: string;
        msg?: string;
        onCancel?: () => void;
        onAccept: () => void;
    }) =>
        confirmAlert({
            title,
            msg,
            onAccept,
            onCancel,
            cancelText: t("cancel-label"),
            acceptText: t("accept-label"),
        });

    async function openItem({ item }: { item: Chapter | Batch | SubBatch }) {
        handleUnsavedChanges(() => {
            const { description, id, rank } = item;

            let kMat: number | undefined;
            let kMo: number | undefined;
            let kOut: number | undefined;
            let listItems: Batch[] | Chapter[] | SubBatch[] | undefined =
                undefined;
            const type = getItemType(item);

            if (type === ITEM_TYPES.CHAPTER) {
                item = item as Chapter;
                kMat = item.kMat;
                kMo = item.kMo;
                kOut = item.kOut;
                listItems = item.batches;
            } else if (type === ITEM_TYPES.BATCH) {
                listItems = (item as Batch).subBatches;
            }

            if (listItems?.length! > 0) {
                setChapters(listItems);
            } else {
                setChapters(null);
            }

            setItemDetails((prev) => {
                const path = !prev?.path
                    ? [{ id, rank: rank }]
                    : [...prev.path, { id, rank: rank }];

                return {
                    path: path,
                    ...item,
                    ...(kMat && { kMat: kMat }),
                    ...(kMo && { kMo: kMo }),
                    ...(kOut && { kOut: kOut }),
                    ...("code" in item && { code: item?.code }),
                    ...("imageUrl" in item && { imageUrl: item?.imageUrl }),
                    type,
                    description,
                    id,
                };
            });
        });
    }

    /**
     * return to parent element
     */
    function returnParentItem() {
        handleUnsavedChanges(() => {
            const parentsPath = itemDetails?.path!;
            const baseChapters = baseChaptersContext!;
            let parent: Chapter | Batch | SubBatch | undefined;
            let type: ShownItem;

            setEdition(false);

            if (parentsPath.length === 1) {
                setItemDetails(null);
                setChapters(baseChapters);
                return;
            }

            function findParent(
                id: number,
                items: Chapter[] | Batch[] | SubBatch[]
            ) {
                for (const item of items) {
                    if (item.id === id) {
                        parent = item;
                        break;
                    } else if ("batches" in item) {
                        findParent(id, item.batches);
                    } else if ("subBatches" in item) {
                        findParent(id, item.subBatches);
                    }
                }
            }

            const parentId = cloneDeep(parentsPath).reverse()[1].id;
            findParent(parentId, baseChapters);

            if (parent) {
                type = getItemType(parent);

                if ("batches" in parent) {
                    setChapters(parent.batches);
                } else if ("subBatches" in parent) {
                    setChapters(parent.subBatches);
                }

                setItemDetails((prev) => {
                    const path = prev?.path?.slice(0, -1);

                    return {
                        ...parent,
                        type,
                        path: path,
                    };
                });
            }
        });
    }

    /**
     * function rendered into the flat list
     */
    const renderItem = ({
        item,
        drag,
        isActive,
    }: RenderItemParams<Chapter | Batch | SubBatch>) => {
        return (
            <ScaleDecorator>
                <View>
                    <ItemCard
                        onSelect={handleItemSelection}
                        activeEditing={edition}
                        parentRank={itemDetails?.path
                            ?.map((v) => v.rank)
                            .join(".")}
                        onPress={async () =>
                            !edition && (await openItem({ item: item }))
                        }
                        delayLongPress={0}
                        onLongPress={() => {
                            if (
                                budgetState?.id === BUDGET_STATES.PROGRESS &&
                                edition
                            ) {
                                drag();
                            }
                        }}
                        disabled={isActive}
                        data={item}
                        onDelete={() =>
                            handleUnsavedChanges(
                                async () =>
                                    handleConfirmAlert({
                                        title: t("want-delete-record"),
                                        onAccept: async () => {
                                            await deleteItems({
                                                itemsId: [item.id],
                                                type:
                                                    itemDetails?.type ===
                                                    ITEM_TYPES.BATCH
                                                        ? ITEM_TYPES.SUBBATCH
                                                        : itemDetails?.type ===
                                                            ITEM_TYPES.CHAPTER
                                                            ? ITEM_TYPES.BATCH
                                                            : ITEM_TYPES.CHAPTER,
                                            })
                                        }
                                    })
                            )
                        }
                        onUpdate={() =>
                            handleUnsavedChanges(() =>
                                openForm({
                                    typeForm: FORM_TYPES.UPDATE,
                                    item,
                                })
                            )
                        }
                        loading={loading}
                    />
                </View>
            </ScaleDecorator>
        );
    };

    return (
        <View style={[styles.container, themedStyles.container]}>
            <View style={styles.menuHeaderContent}>
                <AppHeader
                    title={
                        width < height
                            ? t("budget-details-title")
                            : itemDetails?.type === ITEM_TYPES.CHAPTER
                                ? t("chapter-label")
                                : itemDetails?.type === ITEM_TYPES.BATCH
                                    ? t("batch-label")
                                    : itemDetails?.type === ITEM_TYPES.SUBBATCH
                                        ? t("sub-batch-label")
                                        : t("chapters-label")
                    }
                    actions={[
                        ...[
                            itemDetails?.path && {
                                icon: "keyboard-backspace",
                                onPress: returnParentItem,
                            },
                        ],
                        { icon: "dots-vertical" },
                    ].filter(
                        (item): item is HeaderActions => item !== undefined
                    )}
                    subtitle={
                        width < height
                            ? itemDetails?.type === ITEM_TYPES.CHAPTER
                                ? t("chapter-label")
                                : itemDetails?.type === ITEM_TYPES.BATCH
                                    ? t("batch-label")
                                    : itemDetails?.type === ITEM_TYPES.SUBBATCH
                                        ? t("sub-batch-label")
                                        : t("chapters-label")
                            : ""
                    }
                />
            </View>
            {loading && !baseChaptersContext ? (
                <View
                    style={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ActivityIndicator size="large" />
                </View>
            ) : chapters?.length! > 0 || itemDetails ? (
                <View style={[styles.content, themedStyles.content]}>
                    {itemDetails && (
                        <ItemDetails
                            itemType={itemDetails.type!}
                            details={itemDetails! as any}
                        />
                    )}
                    {itemDetails?.type !== ITEM_TYPES.SUBBATCH && (
                        <View
                            style={[
                                styles.listContainer,
                                themedStyles.listContainer,
                            ]}
                        >
                            {chapters ? (
                                <>
                                    {budgetState?.id ===1 && 
                                        <View
                                            style={{
                                                width: "100%",
                                                alignItems: "flex-end",
                                                paddingHorizontal: 10,
                                            }}
                                        >
                                            <View>
                                                <Button
                                                    onPress={() =>
                                                        handleUnsavedChanges(() => {
                                                            setEdition(!edition);
                                                            setSelectedItems([]);
                                                        })
                                                    }
                                                    text={
                                                        !edition
                                                            ? t("edit-list")
                                                            : t("cancel-label")
                                                    }
                                                    icon={
                                                        <MaterialIcons
                                                            name="edit"
                                                            size={24}
                                                            color="white"
                                                        />
                                                    }
                                                />
                                            </View>
                                        </View>
                                    }
                                    <DraggableFlatList
                                        data={chapters}
                                        onDragEnd={({ data }) => {
                                            handleListUpdate(data);
                                            setChanged(true);
                                        }}
                                        keyExtractor={(item, k) => k.toString()}
                                        renderItem={renderItem}
                                    />
                                </>
                            ) : (
                                <View style={styles.noChaptersTextContainer}>
                                    <Text style={styles.noChaptersText}>
                                        {t("no-chapters-registered")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.noChaptersTextContainer}>
                    <Text style={styles.noChaptersText}>
                        {t("no-chapters-registered")}
                    </Text>
                </View>
            )}
            <View style={styles.fab}>
                <FAB />
            </View>
            <Modal
                visible={showModal}
                onDismiss={() => setShowModal(false)}
                style={themedStyles.modal}
            >
                <View
                    style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                    }}
                >
                    <Button
                        onPress={() => setShowModal(false)}
                        type={BUTTON_TYPES.LINK}
                        icon={
                            <AntDesign
                                name="closecircleo"
                                size={24}
                                color={theme.colors.dark}
                            />
                        }
                    />
                </View>
                {itemDetails?.type === ITEM_TYPES.CHAPTER ? (
                    <BatchForm
                        parent={itemDetails as Chapter}
                        successResult={(chapter) => {
                            setChapterResult(chapter);
                        }}
                        batch={modalInfo?.item as Batch}
                    />
                ) : itemDetails?.type === ITEM_TYPES.BATCH ? (
                    <SubBatchForm
                        parent={itemDetails as Batch}
                        subBatch={modalInfo?.item as SubBatch}
                        successResult={(chapter) => {
                            setChapterResult(chapter);
                        }}
                    />
                ) : (
                    <ChapterForm
                        chapter={modalInfo?.item as Chapter}
                        successResult={(chapter) => {
                            setChapterResult(chapter);
                        }}
                    />
                )}
            </Modal>
            <Modal 
                visible={exportModal.status}
                onDismiss={() => setExportModal((prev) => ({...prev, status: false}))}
                style={themedStyles.modal}
            >
                <ImportExportModal type={exportModal.type} onDismis={() => setExportModal((prev) => ({...prev, status: false}))}/>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: { flexGrow: 1, flex: 1 },
    content: {
        flexDirection: "row",
        flexGrow: 1,
        height: "100%",
        flexWrap: "wrap",
    },
    container: {
        flex: 1,
    },
    noChaptersText: { fontSize: 15 },
    noChaptersTextContainer: {
        height: "100%",
        flexGrow: 1,
        alignItems: "center",
        paddingTop: 30,
    },
    fab: { position: "absolute", bottom: 0, right: 0 },
    menuHeaderContent: { width: "100%" },
});
