import {
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import React, { createRef, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DefaultTheme, TextInput, Title, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

import { Batch, Chapter, CreateBatch, createBatch } from "api/budgets/budgets";
import Select, { Select as SelectProps } from "components/Select/Select";
import { getProviders } from "api/providers/providers";
import Button, { BUTTON_TYPES } from "components/Button/Button";
import {
    addUpValues,
    applyPercentage,
    calculateRank,
    calculateSaleUd,
    multiplyValues,
} from "../../utils/utils";
import {
    DURATION,
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import { ITEM_TYPES } from "../../constants";
import { FileResponse, uploadFile } from "api/attachments/attchments";
import { captureRef } from "react-native-view-shot";
import { fileRoute } from "services/files/files";
import { ParamsContext } from "contexts/SharedParamsProvider";
import { ShownItem } from "../ItemDetails/ItemDetails";
import { formatPrices } from "utils/numbers";
import { UserContext } from "contexts/UserContext";
import { generateUniqueFileName } from "utils/functions";
import FormImage from "../FormImage/FormImage";

type FormBatch = Pick<
    CreateBatch,
    | "description"
    | "code"
    | "subText"
    | "units"
    | "retailPrice"
    | "matCost"
    | "outsourceCost"
    | "moCost"
    | "coefficient"
    | "providerId"
    | "saleDiscount"
    | "amount"
>;

interface BatchResult extends Batch {
    type: ShownItem;
}

export default function BatchForm({
    batch,
    parent,
    successResult,
}: {
    batch?: Batch;
    parent: Chapter;
    successResult: (item: BatchResult) => void;
}) {
    const {
        contextParams: { budgetId },
    } = useContext(ParamsContext)!;
    const { language } = useContext(UserContext);
    const { width, height } = useWindowDimensions();
    const { t } = useTranslation();
    const theme: DefaultTheme = useTheme();
    const [selectedImage, setSelectedImage] = useState<string | undefined>(
        undefined
    );
    const [imageChanged, setImageChanged] = useState<boolean>(false);
    const imageRef = createRef<Image>();
    const [form, setForm] = useState<FormBatch>({
        code: "",
        description: "",
        retailPrice: 0,
        matCost: 0,
        outsourceCost: 0,
        moCost: 0,
        coefficient: 0,
        subText: "",
        units: "",
        providerId: 0,
        saleDiscount: 0,
        amount: 0,
    });
    const [providers, setProviders] = useState<SelectProps[]>([]);
    const [showSubtext, setShowSubtext] = useState<boolean>(false);
    const [unitaryCost, setUnitaryCost] = useState<number>(0);
    const [purchasesDiscount, setPurchaseDiscount] = useState<
        { value: number | null }[]
    >([{ value: null }]);
    const [matSale, setMatSale] = useState<number>(0);
    const [moSale, setMoSale] = useState<number>(0);
    const [outsourceSale, setOutsourceSale] = useState<number>(0);
    const [totalSale, setTotalSale] = useState<number>(0);
    const [saleUd, setSaleUd] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [forceSaleUd, setForceSaleUd] = useState<boolean>(false);
    const [saleUdWithoutDiscount, setSaleUdWithoutDiscount] =
        useState<number>(0);
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const provider = await getProviders();
            setProviders(() =>
                provider.map((v) => ({
                    id: v.id.toString(),
                    description: v.name,
                }))
            );
        })();
    }, []);

    useEffect(() => {
        if (batch) {
            setSelectedImage(batch?.imageUrl || undefined);
            const unitaryCostCalc = addUpValues({
                values: [
                    batch.matCost || 0,
                    batch.outsourceCost || 0,
                    batch.moCost || 0,
                ],
            });
            setUnitaryCost(unitaryCostCalc);
            setTotalCost(
                multiplyValues({
                    values: [unitaryCostCalc, batch.amount],
                })
            );
            setForm((prev) => ({
                ...prev,
                saleDiscount: batch.saleDiscount || 0,
                code: batch?.code || "",
                retailPrice: batch?.retailPrice || 0,
                units: batch?.units || "",
                outsourceCost: batch?.outsourceCost || 0,
                moCost: batch?.moCost || 0,
                coefficient: batch?.coefficient || 0,
                matCost: batch?.matCost || 0,
                amount: batch?.amount || 0,
                subText: batch?.subText || "",
                description: batch?.description || "",
            }));

            if (batch?.subText !== "") {
                setShowSubtext(true);
            }

            setPurchaseDiscount(
                batch?.purchaseDiscounts?.map((v) => ({
                    value: v,
                }))
            );

            const moSale = multiplyValues({
                values: [parent.kMo || 0, batch.moCost],
            });
            setMoSale(moSale);

            const matSale = multiplyValues({
                values: [parent.kMat || 0, batch.matCost],
            });
            setMatSale(matSale);

            const outsourceSale = multiplyValues({
                values: [parent.kOut || 0, batch.outsourceCost],
            });
            setOutsourceSale(outsourceSale);
            setSaleUd(batch.saleUd);
            setTotalSale(batch.totalSale);
        }
    }, [batch, parent]);

    function updateUdTotalSale({
        name,
        value,
        forceSaleUd,
        saleDiscount = 0,
        coefficient,
        amount,
    }: {
        name?: string;
        value?: number;
        forceSaleUd: boolean;
        saleDiscount: number;
        coefficient: number;
        amount: number;
    }) {
        const data = { matSale, moSale, outsourceSale, saleDiscount };
        // Calculate the sale unit
        const saleUnit = forceSaleUd
            ? saleUd
            : calculateSaleUd({
                ...data,
                ...(name && value && { [name]: value }),
            });

        // Adjust saleUd with coefficient if it's greater than 0
        const adjustedSaleUd =
            coefficient > 0 ? saleUnit * coefficient : saleUnit;

        setSaleUd(adjustedSaleUd);
        setTotalSale(
            multiplyValues({
                values: [adjustedSaleUd, amount],
            })
        );
    }

    const addInputPurchaseDiscount = () => {
        setPurchaseDiscount((prev) => {
            const newInputs = [...prev];
            newInputs.push({
                value: 0,
            });
            return newInputs;
        });
    };

    const removeInputPurchaseDiscount = (index: number) => {
        setPurchaseDiscount((prev) => {
            if (prev.length > 1) {
                const newInputs = prev.filter((_, i) => i !== index);

                return newInputs;
            } else {
                return prev;
            }
        });
    };

    const updateInputPurchaseDiscountValue = ({
        index,
        value,
    }: {
        index: number;
        value: number;
    }) => {
        setPurchaseDiscount((prev) => {
            const newInputs = [...prev];
            newInputs[index].value = value;

            setForm((prev) => {
                if ((prev.retailPrice || 0) > 0) {
                    const matCost = applyPercentage({
                        initialValue: prev.retailPrice || prev.matCost || 0,
                        discounts: newInputs.map((v) => v.value || 0),
                    });

                    const unitaryCostCalc = addUpValues({
                        values: [
                            matCost,
                            prev.outsourceCost || 0,
                            prev.moCost || 0,
                        ],
                    });

                    setUnitaryCost(unitaryCostCalc);

                    setTotalCost(
                        multiplyValues({
                            values: [unitaryCostCalc, prev.amount],
                        })
                    );

                    return {
                        ...prev,
                        matCost: matCost,
                    };
                }
                return prev;
            });
            return newInputs;
        });
    };

    function validateForm(): boolean {
        return form.description !== "" && !isNaN(form.amount);
    }

    async function handleAction() {
        if (loading) return;
        setLoading(true);
        if (validateForm()) {
            setError(false);

            try {
                let image: FileResponse | undefined = undefined;

                if (imageChanged) {
                    const localUri = await captureRef(imageRef, {
                        quality: 1,
                    });

                    try {
                        image = await uploadFile({
                            uri: localUri,
                            name: `${generateUniqueFileName(
                                form.description
                            )}.${localUri?.split(".")?.pop()}`,
                            mimeType: "image/jpeg",
                        });
                    } catch (err) {
                        console.error(err);
                        notificationToast({
                            text: t("error-uploading-file"),
                            type: NOTIFICATION_TYPES.DANGER,
                            duration: DURATION.LONG,
                        });
                    }
                }

                const batchParam: CreateBatch = {
                    rank: batch
                        ? batch.rank
                        : calculateRank(parent.batches || []),
                    description: form.description,
                    ...((!batch || !batch?.subBatches?.length) && {
                        matCost: form.matCost || 0,
                        moCost: form.moCost || 0,
                        outsourceCost: form.outsourceCost || 0,
                        totalCost: totalCost,
                        retailPrice: form.retailPrice || 0,
                        purchaseDiscounts: purchasesDiscount.map(
                            (v) => v.value || 0
                        ) || [0],
                    }),
                    code: form.code,
                    amount: form.amount || 0,
                    saleDiscount: form.saleDiscount || 0,
                    totalSale: totalSale,
                    coefficient: form.coefficient || 0,
                    saleUd: saleUd || 0,
                    imageUrl:
                        imageChanged && image
                            ? fileRoute(image?.result?.files?.file[0]?.name)
                            : batch?.imageUrl || "",
                    subText: form.subText,
                    units: form.units,
                    saleUdWithoutDiscount,
                    forceSaleUd: forceSaleUd,
                    providerId: form.providerId || 0,
                };

                if (!batch) {
                    const newItem = await createBatch({
                        budgetId: budgetId!,
                        chapter: parent,
                        batch: batchParam,
                    });

                    if (newItem) {
                        successResult({
                            ...newItem,
                            totalCost,
                            totalSale,
                            type: ITEM_TYPES.BATCH,
                        });
                        notificationToast({
                            text: `${t("success-saving-new-record")}.`,
                            type: NOTIFICATION_TYPES.SUCCESS,
                        });
                    }
                } else {
                    successResult({
                        ...batch,
                        ...batchParam,
                        type: ITEM_TYPES.BATCH,
                    });
                    notificationToast({
                        text: `${t("success-saving-new-record")}.`,
                        type: NOTIFICATION_TYPES.SUCCESS,
                    });
                }
            } catch (error) {
                notificationToast({
                    text: `${t("error-saving-new-record")}.`,
                    type: NOTIFICATION_TYPES.DANGER,
                });
                throw error;
            } finally {
                setLoading(false);
            }
        }
        setError(true);
        setLoading(false);
    }

    return (
        <View style={{ maxHeight: "100%" }}>
            <View>
                <Title>
                    {!batch ? t("create-label") : t("update-label")}{" "}
                    {t("batch-label")}
                </Title>
            </View>
            <ScrollView>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        flexDirection: "row",
                        flexWrap: "wrap",
                    }}
                >
                    <View
                        style={{
                            maxHeight: "100%",
                            paddingVertical: 15,
                            minHeight: 330,
                            alignItems: "center",
                            ...(width < height && {
                                width: "100%",
                            }),
                        }}
                    >
                        <FormImage
                            ref={imageRef}
                            imageUrl={selectedImage}
                            title={`${t("image-of")} ${t("batch-label")}`}
                            label={t("select-image")}
                            onChanged={() => setImageChanged(true)}
                        />
                    </View>

                    <View
                        style={[
                            styles.formContainer,
                            {
                                ...(width > height && {
                                    paddingHorizontal: 5,
                                    width: "40%",
                                }),
                            },
                        ]}
                    >
                        <ScrollView>
                            <View style={styles.flexDirectionRow}>
                                <View
                                    style={[
                                        styles.halfSizeWidth,
                                        styles.paddingFirst,
                                        styles.item,
                                        {
                                            ...(width < height && {
                                                width: "50%",
                                            }),
                                        },
                                    ]}
                                >
                                    <TextInput
                                        mode="outlined"
                                        label={t("ud-label")}
                                        value={form.units}
                                        onChangeText={(value) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                ["units"]: value,
                                            }))
                                        }
                                    />
                                </View>
                                <View
                                    style={[
                                        styles.halfSizeWidth,
                                        styles.paddingLast,
                                        styles.item,
                                        {
                                            ...(width < height && {
                                                width: "50%",
                                            }),
                                        },
                                    ]}
                                >
                                    <TextInput
                                        mode="outlined"
                                        label={t("code-label")}
                                        value={form.code || ""}
                                        onChangeText={(value) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                ["code"]: value,
                                            }))
                                        }
                                    />
                                </View>
                            </View>
                            <View style={styles.item}>
                                <TextInput
                                    mode="outlined"
                                    label={
                                        <>
                                            {t("description-label")}
                                            <Text style={{ color: "red" }}>
                                                *
                                            </Text>
                                        </>
                                    }
                                    value={form.description}
                                    onChangeText={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            ["description"]: value,
                                        }))
                                    }
                                />
                            </View>
                            <View style={styles.item}>
                                <Select
                                    options={providers}
                                    label={t("provider-label")}
                                    placeholder={t("provider-label")}
                                    onSelect={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            ["providerId"]: parseInt(value),
                                        }))
                                    }
                                    selectedValue={
                                        (form.providerId !== 0 &&
                                            form.providerId?.toString()) ||
                                        ""
                                    }
                                />
                            </View>
                            <View style={[styles.flexDirectionRow]}>
                                {showSubtext ? (
                                    <>
                                        <TextInput
                                            style={{
                                                flexGrow: 1,
                                            }}
                                            outlineStyle={{
                                                borderTopRightRadius: 0,
                                                borderBottomRightRadius: 0,
                                            }}
                                            mode="outlined"
                                            label={t("subtext-label")}
                                            value={form.subText || ""}
                                            onChangeText={(value) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    ["subText"]: value,
                                                }))
                                            }
                                        />
                                        <View>
                                            <Button
                                                onPress={() =>
                                                    setShowSubtext(!showSubtext)
                                                }
                                                type={BUTTON_TYPES.LINK}
                                                buttonStyle={{
                                                    borderTopLeftRadius: 0,
                                                    borderBottomLeftRadius: 0,
                                                    backgroundColor:
                                                        theme.colors.primary,
                                                    marginTop: 6,
                                                    height: 50,
                                                    width: 40,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                                icon={
                                                    <AntDesign
                                                        name="minus"
                                                        size={24}
                                                        color="white"
                                                    />
                                                }
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <View
                                        style={[
                                            styles.halfSizeWidth,
                                            styles.item,
                                        ]}
                                    >
                                        <Button
                                            buttonStyle={{
                                                marginVertical: 5,
                                            }}
                                            type={BUTTON_TYPES.SECONDARY}
                                            onPress={() =>
                                                setShowSubtext(!showSubtext)
                                            }
                                        >
                                            {t("add-subtext-label")}
                                        </Button>
                                    </View>
                                )}
                            </View>
                            {(!batch || batch?.subBatches?.length < 1) && (
                                <View style={styles.section}>
                                    <Text style={{ fontSize: 20 }}>
                                        {t("costs-label")}
                                    </Text>
                                    <View style={styles.flexDirectionRow}>
                                        <View style={[styles.halfSizeWidth]}>
                                            <TextInput
                                                mode="outlined"
                                                label="PVP"
                                                keyboardType="decimal-pad"
                                                value={form.retailPrice?.toString()}
                                                onChangeText={(value) => {
                                                    setForm((prev) => {
                                                        const val =
                                                            parseFloat(value) ||
                                                            0;
                                                        const matCost =
                                                            applyPercentage({
                                                                initialValue:
                                                                    val,
                                                                discounts:
                                                                    purchasesDiscount.map(
                                                                        (v) =>
                                                                            v.value ||
                                                                            0
                                                                    ),
                                                            });

                                                        const unitaryCostCalc =
                                                            addUpValues({
                                                                values: [
                                                                    matCost,
                                                                    prev.outsourceCost ||
                                                                        0,
                                                                    prev.moCost ||
                                                                        0,
                                                                ],
                                                            });

                                                        setUnitaryCost(
                                                            unitaryCostCalc
                                                        );

                                                        setTotalCost(
                                                            multiplyValues({
                                                                values: [
                                                                    unitaryCostCalc,
                                                                    prev.amount,
                                                                ],
                                                            })
                                                        );

                                                        const matSale =
                                                            multiplyValues({
                                                                values: [
                                                                    matCost,
                                                                    parent.kMat,
                                                                ],
                                                            });

                                                        setMatSale(matSale);

                                                        updateUdTotalSale({
                                                            name: "matSale",
                                                            value: matSale,
                                                            forceSaleUd,
                                                            saleDiscount:
                                                                prev.saleDiscount,
                                                            coefficient:
                                                                prev.coefficient,
                                                            amount: prev.amount,
                                                        });

                                                        return {
                                                            ...prev,
                                                            ["retailPrice"]:
                                                                val,
                                                            matCost: matCost,
                                                        };
                                                    });
                                                }}
                                                right={
                                                    <TextInput.Icon
                                                        size={20}
                                                        icon="currency-eur"
                                                    />
                                                }
                                            />
                                        </View>
                                        {purchasesDiscount.map((_, k) => (
                                            <View
                                                key={k}
                                                style={[
                                                    styles.halfSizeWidth,
                                                    {
                                                        marginVertical: 10,
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                    },
                                                ]}
                                            >
                                                <TextInput
                                                    mode="outlined"
                                                    label={t(
                                                        "purchase-discount-label"
                                                    )}
                                                    keyboardType="decimal-pad"
                                                    value={purchasesDiscount[
                                                        k
                                                    ].value?.toString()}
                                                    onChangeText={(value) =>
                                                        updateInputPurchaseDiscountValue(
                                                            {
                                                                index: k,
                                                                value:
                                                                    parseFloat(
                                                                        value
                                                                    ) || 0,
                                                            }
                                                        )
                                                    }
                                                    style={{
                                                        flexGrow: 1,
                                                    }}
                                                    outlineStyle={{
                                                        borderTopEndRadius: 0,
                                                        borderBottomEndRadius: 0,
                                                    }}
                                                />
                                                <View
                                                    style={{
                                                        flexDirection: "row",
                                                    }}
                                                >
                                                    {k === 0 ? (
                                                        <Button
                                                            type={
                                                                BUTTON_TYPES.LINK
                                                            }
                                                            buttonStyle={{
                                                                borderTopLeftRadius: 0,
                                                                borderBottomLeftRadius: 0,
                                                                backgroundColor:
                                                                    theme.colors
                                                                        .primary,
                                                                marginTop: 6,
                                                                height: 50,
                                                                width: 40,
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                            }}
                                                            icon={
                                                                <AntDesign
                                                                    name="plus"
                                                                    size={24}
                                                                    color="white"
                                                                />
                                                            }
                                                            onPress={
                                                                addInputPurchaseDiscount
                                                            }
                                                        />
                                                    ) : (
                                                        <Button
                                                            type={
                                                                BUTTON_TYPES.LINK
                                                            }
                                                            buttonStyle={{
                                                                borderTopLeftRadius: 0,
                                                                borderBottomLeftRadius: 0,
                                                                backgroundColor:
                                                                    theme.colors
                                                                        .primary,
                                                                marginTop: 6,
                                                                height: 50,
                                                                width: 40,
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                            }}
                                                            icon={
                                                                <AntDesign
                                                                    name="delete"
                                                                    size={24}
                                                                    color="white"
                                                                />
                                                            }
                                                            onPress={() =>
                                                                removeInputPurchaseDiscount(
                                                                    k
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.flexDirectionRow}>
                                        <View
                                            style={[
                                                styles.item,
                                                styles.inputThreeInLine,
                                                styles.marginFirst,
                                            ]}
                                        >
                                            <TextInput
                                                mode="outlined"
                                                label={t("material-label")}
                                                keyboardType="decimal-pad"
                                                disabled={
                                                    form.retailPrice
                                                        ? true
                                                        : false
                                                }
                                                value={form.matCost?.toString()}
                                                onChangeText={(value) =>
                                                    setForm((prev) => {
                                                        const val =
                                                            parseFloat(value) ||
                                                            0;
                                                        const matSale =
                                                            multiplyValues({
                                                                values: [
                                                                    parent.kMat ||
                                                                        0,
                                                                    val,
                                                                ],
                                                            });
                                                        updateUdTotalSale({
                                                            name: "matSale",
                                                            value: matSale,
                                                            forceSaleUd,
                                                            saleDiscount:
                                                                prev.saleDiscount,
                                                            coefficient:
                                                                prev.coefficient,
                                                            amount: prev.amount,
                                                        });
                                                        setMatSale(
                                                            multiplyValues({
                                                                values: [
                                                                    parent.kMat ||
                                                                        0,
                                                                    val,
                                                                ],
                                                            })
                                                        );
                                                        const unitaryCostCalc =
                                                            addUpValues({
                                                                values: [
                                                                    val,
                                                                    form.outsourceCost ||
                                                                        0,
                                                                    form.moCost ||
                                                                        0,
                                                                ],
                                                            });

                                                        setUnitaryCost(
                                                            unitaryCostCalc
                                                        );

                                                        setTotalCost(
                                                            multiplyValues({
                                                                values: [
                                                                    unitaryCostCalc,
                                                                    prev.amount,
                                                                ],
                                                            })
                                                        );
                                                        return {
                                                            ...prev,
                                                            ...(!prev.retailPrice && {
                                                                ["matCost"]:
                                                                    val,
                                                            }),
                                                        };
                                                    })
                                                }
                                                {...(width > height && {
                                                    right: (
                                                        <TextInput.Icon
                                                            size={20}
                                                            icon="currency-eur"
                                                        />
                                                    ),
                                                })}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                styles.item,
                                                styles.inputThreeInLine,
                                            ]}
                                        >
                                            <TextInput
                                                mode="outlined"
                                                keyboardType="decimal-pad"
                                                label={t("outsource-label")}
                                                value={form.outsourceCost?.toString()}
                                                onChangeText={(value) =>
                                                    setForm((prev) => {
                                                        const val =
                                                            parseFloat(value) ||
                                                            0;
                                                        const outsourceSale =
                                                            multiplyValues({
                                                                values: [
                                                                    parent.kOut ||
                                                                        0,
                                                                    val,
                                                                ],
                                                            });
                                                        updateUdTotalSale({
                                                            name: "outsourceSale",
                                                            value: outsourceSale,
                                                            forceSaleUd,
                                                            saleDiscount:
                                                                prev.saleDiscount,
                                                            coefficient:
                                                                prev.coefficient,
                                                            amount: prev.amount,
                                                        });
                                                        setOutsourceSale(
                                                            outsourceSale
                                                        );
                                                        const unitaryCostCalc =
                                                            addUpValues({
                                                                values: [
                                                                    prev.matCost ||
                                                                        0,
                                                                    val,
                                                                    prev.moCost ||
                                                                        0,
                                                                ],
                                                            });
                                                        setUnitaryCost(
                                                            unitaryCostCalc
                                                        );

                                                        setTotalCost(
                                                            multiplyValues({
                                                                values: [
                                                                    unitaryCostCalc,
                                                                    prev.amount,
                                                                ],
                                                            })
                                                        );
                                                        return {
                                                            ...prev,
                                                            ["outsourceCost"]:
                                                                val,
                                                        };
                                                    })
                                                }
                                                {...(width > height && {
                                                    right: (
                                                        <TextInput.Icon
                                                            size={20}
                                                            icon="currency-eur"
                                                        />
                                                    ),
                                                })}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                styles.item,
                                                styles.inputThreeInLine,
                                                styles.marginLast,
                                            ]}
                                        >
                                            <TextInput
                                                mode="outlined"
                                                keyboardType="decimal-pad"
                                                label={`mo (${t("mo-label")})`}
                                                value={form.moCost?.toString()}
                                                onChangeText={(value) =>
                                                    setForm((prev) => {
                                                        const val =
                                                            parseFloat(value) ||
                                                            0;
                                                        const moSale =
                                                            multiplyValues({
                                                                values: [
                                                                    parent.kMo ||
                                                                        0,
                                                                    val,
                                                                ],
                                                            });
                                                        const unitaryCostCalc =
                                                            addUpValues({
                                                                values: [
                                                                    prev.matCost ||
                                                                        0,
                                                                    prev.outsourceCost ||
                                                                        0,
                                                                    val,
                                                                ],
                                                            });
                                                        const totalCostCalc =
                                                            multiplyValues({
                                                                values: [
                                                                    unitaryCostCalc,
                                                                    prev.amount,
                                                                ],
                                                            });

                                                        updateUdTotalSale({
                                                            name: "moSale",
                                                            value: moSale,
                                                            forceSaleUd,
                                                            saleDiscount:
                                                                prev.saleDiscount,
                                                            coefficient:
                                                                prev.coefficient,
                                                            amount: prev.amount,
                                                        });

                                                        setMoSale(moSale);
                                                        setUnitaryCost(
                                                            unitaryCostCalc
                                                        );
                                                        setTotalCost(
                                                            totalCostCalc
                                                        );

                                                        return {
                                                            ...prev,
                                                            ["moCost"]: val,
                                                        };
                                                    })
                                                }
                                                {...(width > height && {
                                                    right: (
                                                        <TextInput.Icon
                                                            size={20}
                                                            icon="currency-eur"
                                                        />
                                                    ),
                                                })}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}

                            <View style={[styles.section]}>
                                <Text style={{ fontSize: 20 }}>
                                    {t("sales-label")}
                                </Text>
                                <View
                                    style={[
                                        styles.item,
                                        styles.flexDirectionRow,
                                    ]}
                                >
                                    <View style={[styles.halfSizeWidth]}>
                                        <TextInput
                                            mode="outlined"
                                            label={t("label-discount")}
                                            keyboardType="decimal-pad"
                                            value={form.saleDiscount.toString()}
                                            onChangeText={(value) =>
                                                setForm((prev) => {
                                                    const val =
                                                        parseFloat(value) || 0;
                                                    updateUdTotalSale({
                                                        forceSaleUd,
                                                        saleDiscount: val,
                                                        coefficient:
                                                            prev.coefficient,
                                                        amount: prev.amount,
                                                    });
                                                    return {
                                                        ...prev,
                                                        ["saleDiscount"]: val,
                                                    };
                                                })
                                            }
                                            right={
                                                <TextInput.Icon
                                                    size={20}
                                                    icon="percent"
                                                />
                                            }
                                        />
                                    </View>
                                    <View style={[styles.halfSizeWidth]}>
                                        <TextInput
                                            mode="outlined"
                                            keyboardType="decimal-pad"
                                            label={t("k-batch-label")}
                                            value={form.coefficient.toString()}
                                            onChangeText={(value) =>
                                                setForm((prev) => {
                                                    const val =
                                                        parseFloat(value) || 0;
                                                    updateUdTotalSale({
                                                        forceSaleUd,
                                                        saleDiscount:
                                                            prev.saleDiscount,
                                                        coefficient: val,
                                                        amount: prev.amount,
                                                    });
                                                    return {
                                                        ...prev,
                                                        ["coefficient"]: val,
                                                    };
                                                })
                                            }
                                        />
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.item,
                                        styles.flexDirectionRow,
                                    ]}
                                >
                                    <View>
                                        <Text style={styles.subLabel}>
                                            {t("material-label")}
                                        </Text>
                                        <View style={[styles.totals]}>
                                            <Text
                                                style={[
                                                    styles.subLabel,
                                                    {
                                                        color: theme.colors
                                                            .success,
                                                    },
                                                ]}
                                            >
                                                {formatPrices({
                                                    number: matSale,
                                                    language,
                                                })}{" "}
                                            </Text>
                                            <FontAwesome
                                                name="euro"
                                                size={16}
                                                color={theme.colors.success}
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.halfSizeWidth]}>
                                        <Text style={styles.subLabel}>
                                            {t("mo-label")}
                                        </Text>
                                        <View style={[styles.totals]}>
                                            <Text
                                                style={[
                                                    styles.subLabel,
                                                    {
                                                        color: theme.colors
                                                            .success,
                                                    },
                                                ]}
                                            >
                                                {formatPrices({
                                                    number: moSale,
                                                    language,
                                                })}{" "}
                                            </Text>
                                            <FontAwesome
                                                name="euro"
                                                size={16}
                                                color={theme.colors.success}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.item,
                                        styles.flexDirectionRow,
                                    ]}
                                >
                                    <View>
                                        <Text style={styles.subLabel}>
                                            {t("outsource-label")}
                                        </Text>
                                        <View style={[styles.totals]}>
                                            <Text
                                                style={[
                                                    styles.subLabel,
                                                    {
                                                        color: theme.colors
                                                            .success,
                                                    },
                                                ]}
                                            >
                                                {formatPrices({
                                                    number: outsourceSale,
                                                    language,
                                                })}{" "}
                                            </Text>
                                            <FontAwesome
                                                name="euro"
                                                size={16}
                                                color={theme.colors.success}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footerButton}>
                {error && (
                    <Text
                        style={[
                            styles.subLabel,
                            { color: theme.colors.dangerIntense },
                        ]}
                    >
                        {t("required-fields")}
                    </Text>
                )}
                <View
                    style={{
                        width: "100%",
                        alignItems: "flex-end",
                    }}
                >
                    <View style={[styles.item, styles.flexDirectionRow]}>
                        <View style={[styles.halfSizeWidth]}>
                            <TextInput
                                mode="outlined"
                                keyboardType="decimal-pad"
                                label={
                                    <>
                                        {t("quantity-label")}
                                        <Text
                                            style={{
                                                color: "red",
                                            }}
                                        >
                                            *
                                        </Text>
                                    </>
                                }
                                value={form.amount.toString()}
                                onChangeText={(value) =>
                                    setForm((prev) => {
                                        const val = parseFloat(value) || 0;
                                        const unitaryCostCalc = addUpValues({
                                            values: [
                                                prev.matCost || 0,
                                                prev.outsourceCost || 0,
                                                prev.moCost || 0,
                                            ],
                                        });

                                        updateUdTotalSale({
                                            forceSaleUd,
                                            saleDiscount: prev.saleDiscount,
                                            coefficient: prev.coefficient,
                                            amount: val,
                                        });

                                        setTotalCost(
                                            multiplyValues({
                                                values: [unitaryCostCalc, val],
                                            })
                                        );
                                        return {
                                            ...prev,
                                            ["amount"]: val,
                                        };
                                    })
                                }
                                right={
                                    <TextInput.Icon
                                        size={20}
                                        icon="currency-eur"
                                    />
                                }
                            />
                        </View>
                    </View>
                    <Text style={styles.subLabel}>{t("unitary-label")}</Text>
                    <View style={styles.totals}>
                        {(!batch || batch?.subBatches?.length < 1) && (
                            <>
                                <Text
                                    style={[
                                        styles.subLabel,
                                        { color: theme.colors.danger },
                                    ]}
                                >
                                    {formatPrices({
                                        number: unitaryCost,
                                        language,
                                    })}{" "}
                                    <FontAwesome
                                        name="euro"
                                        size={16}
                                        color={theme.colors.danger}
                                    />
                                </Text>
                                <Text> - </Text>
                            </>
                        )}
                        <TextInput
                            mode="flat"
                            keyboardType="decimal-pad"
                            style={{
                                width: 120,
                                backgroundColor: theme.colors.primaryContrast,
                                padding: 0,
                                height: 30,
                            }}
                            textColor={theme.colors.success}
                            value={saleUd.toString()}
                            onChangeText={(value) => {
                                const val = parseFloat(value) || 0;
                                setForceSaleUd(true);
                                setSaleUdWithoutDiscount(val);
                                setSaleUd(val);
                                setTotalSale(val * form.amount);
                            }}
                            right={
                                <TextInput.Icon
                                    size={15}
                                    icon="close"
                                    onPress={() => {
                                        setForceSaleUd(false);
                                        const val = addUpValues({
                                            values: [
                                                matSale,
                                                moSale,
                                                form.outsourceCost || 0,
                                            ],
                                        });
                                        setSaleUdWithoutDiscount(val);
                                        setSaleUd(val);
                                        setTotalSale(val * form.amount);
                                    }}
                                />
                            }
                        />
                    </View>
                    <Text style={styles.subLabel}>{t("total-label")}</Text>
                    <View style={styles.totals}>
                        {(!batch || batch?.subBatches?.length < 1) && (
                            <>
                                <Text
                                    style={[
                                        styles.subLabel,
                                        { color: theme.colors.danger },
                                    ]}
                                >
                                    {formatPrices({
                                        number: totalCost,
                                        language,
                                    })}{" "}
                                    <FontAwesome
                                        name="euro"
                                        size={16}
                                        color={theme.colors.danger}
                                    />
                                </Text>
                                <Text> - </Text>
                            </>
                        )}
                        <Text
                            style={[
                                styles.subLabel,
                                { color: theme.colors.success },
                            ]}
                        >
                            {formatPrices({ number: totalSale, language })}{" "}
                            <FontAwesome
                                name="euro"
                                size={16}
                                color={theme.colors.success}
                            />
                        </Text>
                    </View>
                </View>

                <Button
                    disabled={loading}
                    text={t("save-label")}
                    onPress={async () => await handleAction()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        borderRadius: 10,
        width: 300,
        height: 300,
    },
    imageContainer: {
        overflow: "hidden",
        borderRadius: 10,
        position: "relative",
    },
    formContainer: { flexGrow: 1 },
    halfSizeWidth: {
        paddingHorizontal: 5,
        justifyContent: "center",
        width: "50%",
    },
    flexDirectionRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    paddingFirst: {
        paddingLeft: 0,
    },
    paddingLast: {
        paddingRight: 0,
    },
    item: {
        paddingVertical: 5,
    },
    section: {
        paddingVertical: 15,
    },
    inputThreeInLine: {
        width: "31.5%",
    },
    marginLast: { marginRight: 5 },
    marginFirst: { marginLeft: 5 },
    subLabel: { fontSize: 17, alignItems: "center" },
    totals: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerButton: {
        width: "100%",
    },
});
