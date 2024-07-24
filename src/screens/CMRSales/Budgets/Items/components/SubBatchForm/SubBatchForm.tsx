import {
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import React, { createRef, useContext, useEffect, useState } from "react";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DefaultTheme, TextInput, Title, useTheme } from "react-native-paper";
import { captureRef } from "react-native-view-shot";
import { Image } from "expo-image";

import {
    Batch,
    CreateSubBatch,
    createSubBatch,
    SubBatch,
} from "api/budgets/budgets";
import { ShownItem } from "../ItemDetails/ItemDetails";
import Button, { BUTTON_TYPES } from "components/Button/Button";
import { ParamsContext } from "contexts/SharedParamsProvider";
import { UserContext } from "contexts/UserContext";
import Select, { Select as SelectProps } from "components/Select/Select";
import { getProviders } from "api/providers/providers";
import {
    addUpValues,
    applyPercentage,
    calculateRank,
    multiplyValues,
} from "../../utils/utils";
import { formatPrices } from "utils/numbers";
import { FileResponse, uploadFile } from "api/attachments/attchments";
import { generateUniqueFileName } from "utils/functions";
import {
    DURATION,
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import { fileRoute } from "services/files/files";
import { ITEM_TYPES } from "../../constants";
import FormImage from "../FormImage/FormImage";

type FormSubBatch = {
    description: string;
    code: string;
    subText: string;
    units: string;
    retailPrice: number;
    matCost: number;
    outsourceCost: number;
    moCost: number;
    providerId: number | undefined;
    amount: number;
};

interface SubBatchResult extends SubBatch {
    type: ShownItem;
}

export default function SubBatchForm({
    subBatch,
    parent,
    successResult,
}: {
    subBatch?: SubBatch;
    parent: Batch;
    successResult: (item: SubBatchResult) => void;
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
    const [form, setForm] = useState<FormSubBatch>({
        code: "",
        description: "",
        retailPrice: 0,
        matCost: 0,
        outsourceCost: 0,
        moCost: 0,
        subText: "",
        units: "",
        providerId: undefined,
        amount: 0,
    });
    const [providers, setProviders] = useState<SelectProps[]>([]);
    const [showSubtext, setShowSubtext] = useState<boolean>(false);
    const [unitaryCost, setUnitaryCost] = useState<number>(0);
    const [purchasesDiscount, setPurchasesDiscount] = useState<
        { value: number | null }[]
    >([{ value: null }]);
    const [totalCost, setTotalCost] = useState<number>(0);
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
        if (subBatch) {
            setSelectedImage(subBatch?.imageUrl || undefined);
            const unitaryCostCalc = addUpValues({
                values: [
                    subBatch.matCost || 0,
                    subBatch.outsourceCost || 0,
                    subBatch.moCost || 0,
                ],
            });
            setUnitaryCost(unitaryCostCalc);
            setTotalCost(
                multiplyValues({
                    values: [unitaryCostCalc, subBatch.amount],
                })
            );
            setForm((prev) => ({
                ...prev,
                code: subBatch?.code || "",
                retailPrice: subBatch?.retailPrice || 0,
                units: subBatch?.units || "",
                outsourceCost: subBatch?.outsourceCost || 0,
                moCost: subBatch?.moCost || 0,
                matCost: subBatch?.matCost || 0,
                amount: subBatch?.amount || 0,
                subText: subBatch?.subText || "",
                description: subBatch?.description || "",
            }));

            if (subBatch?.subText !== "") {
                setShowSubtext(true);
            }

            setPurchasesDiscount(
                subBatch?.purchaseDiscounts?.map((v) => ({
                    value: v,
                }))
            );
        }
    }, [subBatch, parent]);

    const addInputPurchaseDiscount = () => {
        setPurchasesDiscount((prev) => {
            const newInputs = [...prev];
            newInputs.push({
                value: 0,
            });
            return newInputs;
        });
    };

    const removeInputPurchaseDiscount = (index: number) => {
        setPurchasesDiscount((prev) => {
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
        setPurchasesDiscount((prev) => {
            const newInputs = [...prev];
            newInputs[index].value = value;

            setForm((prev) => {
                if (prev.retailPrice > 0) {
                    const matCost = applyPercentage({
                        initialValue: prev.retailPrice || prev.matCost,
                        discounts: newInputs.map((v) => v.value || 0),
                    });

                    const unitaryCostCalc = addUpValues({
                        values: [matCost, prev.outsourceCost, prev.moCost],
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
                            )}.${localUri!.split(".")?.pop()}`,
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

                const subBatchParam: CreateSubBatch = {
                    rank: subBatch
                        ? subBatch.rank
                        : calculateRank(parent.subBatches || []),
                    description: form.description,
                    matCost: form.matCost || 0,
                    moCost: form.moCost || 0,
                    code: form.code,
                    outsourceCost: form.outsourceCost || 0,
                    amount: form.amount || 0,
                    totalCost: totalCost,
                    retailPrice: form.retailPrice || 0,
                    purchaseDiscounts: purchasesDiscount.map(
                        (v) => v.value || 0
                    ) || [0],
                    imageUrl:
                        imageChanged && image
                            ? fileRoute(image?.result?.files?.file[0]?.name)
                            : subBatch?.imageUrl || "",
                    subText: form.subText,
                    units: form.units,
                    providerId: form.providerId || 0,
                };

                if (!subBatch) {
                    const newSubBatch = await createSubBatch({
                        budgetId: budgetId!,
                        subBatch: subBatchParam,
                        batch: parent,
                    });

                    if (newSubBatch) {
                        successResult({
                            ...newSubBatch,
                            totalCost,
                            type: ITEM_TYPES.SUBBATCH,
                        });
                        notificationToast({
                            text: `${t("success-saving-new-record")}.`,
                            type: NOTIFICATION_TYPES.SUCCESS,
                        });
                    }
                } else {
                    successResult({
                        ...subBatch,
                        ...subBatchParam,
                        type: ITEM_TYPES.SUBBATCH,
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
                    {!subBatch ? t("create-label") : t("update-label")}{" "}
                    {t("sub-batch-label")}
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
                            title={`${t("image-of")} ${t("sub-batch-label")}`}
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
                                        value={form.code}
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
                                            value={form.subText}
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
                                            value={form.retailPrice.toString()}
                                            onChangeText={(value) => {
                                                setForm((prev) => {
                                                    const val =
                                                        parseFloat(value) || 0;
                                                    const matCost =
                                                        applyPercentage({
                                                            initialValue: val,
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
                                                                prev.outsourceCost,
                                                                prev.moCost,
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
                                                        ["retailPrice"]: val,
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
                                                onChangeText={(value) => {
                                                    const val =
                                                        parseFloat(value) || 0;

                                                    updateInputPurchaseDiscountValue(
                                                        {
                                                            index: k,
                                                            value: val,
                                                        }
                                                    );
                                                }}
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
                                                        type={BUTTON_TYPES.LINK}
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
                                                        type={BUTTON_TYPES.LINK}
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
                                                form.retailPrice ? true : false
                                            }
                                            value={form.matCost.toString()}
                                            onChangeText={(value) =>
                                                setForm((prev) => {
                                                    const val =
                                                        parseFloat(value) || 0;
                                                    const unitaryCostCalc =
                                                        addUpValues({
                                                            values: [
                                                                val,
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
                                                    return {
                                                        ...prev,
                                                        ...(!prev.retailPrice && {
                                                            ["matCost"]: val,
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
                                            value={form.outsourceCost.toString()}
                                            onChangeText={(value) =>
                                                setForm((prev) => {
                                                    const val =
                                                        parseFloat(value) || 0;
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
                                                        ["outsourceCost"]: val,
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
                                            value={form.moCost.toString()}
                                            onChangeText={(value) =>
                                                setForm((prev) => {
                                                    const val =
                                                        parseFloat(value) || 0;
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
                                        setTotalCost(() => {
                                            const d = multiplyValues({
                                                values: [
                                                    unitaryCost,
                                                    parseFloat(value) || 0,
                                                ],
                                            });
                                            return d;
                                        });
                                        return {
                                            ...prev,
                                            ["amount"]: parseFloat(value) || 0,
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
                        <Text
                            style={[
                                styles.subLabel,
                                { color: theme.colors.danger },
                            ]}
                        >
                            {formatPrices({ number: unitaryCost, language })}{" "}
                            <FontAwesome
                                name="euro"
                                size={16}
                                color={theme.colors.danger}
                            />
                        </Text>
                    </View>
                    <Text style={styles.subLabel}>{t("total-label")}</Text>
                    <View style={styles.totals}>
                        <Text
                            style={[
                                styles.subLabel,
                                { color: theme.colors.danger },
                            ]}
                        >
                            {formatPrices({ number: totalCost, language })}{" "}
                            <FontAwesome
                                name="euro"
                                size={16}
                                color={theme.colors.danger}
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
