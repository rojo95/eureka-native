import { ScrollView, StyleSheet, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Button from "components/Button/Button";
import { TextInput, Title } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Chapter, CreateChapter, createChapter } from "api/budgets/budgets";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import { ParamsContext } from "contexts/SharedParamsProvider";
import { ShownItem } from "../ItemDetails/ItemDetails";
import { ITEM_TYPES } from "../../constants";
import Text from "components/Text/Text";

interface ItemResult extends Chapter {
    type: ShownItem;
}

export default function ChapterForm({
    chapter,
    successResult,
}: {
    chapter?: Chapter;
    successResult: (chapter: ItemResult) => void;
}) {
    const { t } = useTranslation();
    const {
        contextParams: { budgetId, chapters },
    } = useContext(ParamsContext)!;
    const [loading, setLoading] = useState<boolean>(false);
    const [form, setForm] = useState<Omit<CreateChapter, "rank">>({
        kMat: 0,
        kMo: 0,
        kOut: 0,
        description: "",
    });
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (chapter) {
            setForm((prev) => ({
                ...prev,
                kMat: chapter?.kMat || 0,
                kMo: chapter?.kMo || 0,
                kOut: chapter?.kOut || 0,
                description: chapter?.description,
            }));
        }
    }, [chapter]);

    function validateForm(): boolean {
        return form.description !== "";
    }

    async function handleAction() {
        if (loading) return;
        if (validateForm()) {
            setLoading(true);
            setError(false);

            const data: CreateChapter = {
                kMat: form.kMat,
                kMo: form.kMo,
                kOut: form.kOut,
                description: form.description,
                rank: !chapter ? chapters?.length! + 1 : chapter.rank,
            };

            try {
                const type = ITEM_TYPES.CHAPTER;
                if (!chapter) {
                    const newChapter = await createChapter({
                        budgetId: budgetId!,
                        chapter: data,
                    });

                    if (newChapter) {
                        successResult({
                            ...newChapter,
                            type: type,
                        });
                        notificationToast({
                            text: `${t("success-saving-new-record")}.`,
                            type: NOTIFICATION_TYPES.SUCCESS,
                        });
                    }
                } else {
                    successResult({
                        ...chapter,
                        ...data,
                        type: type,
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
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <Title>
                        {!chapter ? t("create-label") : t("update-label")}{" "}
                        {t("chapter-label")}
                    </Title>
                </View>

                <View style={styles.section}>
                    <View style={[styles.inputView]}>
                        <TextInput
                            mode="outlined"
                            label={
                                <>
                                    {t("description-label")}
                                    <Text style={{ color: "red" }}>*</Text>
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

                    <View style={styles.kStyles}>
                        <View style={[styles.inputView, styles.threeInRow]}>
                            <TextInput
                                keyboardType="decimal-pad"
                                mode="outlined"
                                label="kMat"
                                value={form.kMat.toString()}
                                onChangeText={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        ["kMat"]: parseFloat(value) || 0,
                                    }))
                                }
                            />
                        </View>
                        <View style={[styles.inputView, styles.threeInRow]}>
                            <TextInput
                                keyboardType="decimal-pad"
                                mode="outlined"
                                label="kMo"
                                value={form.kMo.toString()}
                                onChangeText={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        ["kMo"]: parseFloat(value) || 0,
                                    }))
                                }
                            />
                        </View>
                        <View style={[styles.inputView, styles.threeInRow]}>
                            <TextInput
                                keyboardType="decimal-pad"
                                mode="outlined"
                                label="kOut"
                                value={form.kOut.toString()}
                                onChangeText={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        ["kOut"]: parseFloat(value) || 0,
                                    }))
                                }
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footerButton}>
                {error && (
                    <Text style={[styles.subLabel, { color: "red" }]}>
                        {t("required-fields")}
                    </Text>
                )}

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
    subLabel: { fontSize: 17, alignItems: "center" },
    imageContainer: {
        overflow: "hidden",
        borderRadius: 10,
        position: "relative",
    },
    image: {
        borderRadius: 10,
        width: 300,
        height: 300,
    },
    halfWidhtInputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    container: {
        maxHeight: "100%",
        paddingVertical: 15,
        alignItems: "center",
    },
    content: { width: "100%" },
    kStyles: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
    inputView: {
        marginBottom: 10,
        width: "100%",
    },
    halfWidhtInput: {
        justifyContent: "center",
        width: "48%",
    },
    threeInRow: {
        width: "30%",
    },
    section: {
        width: "100%",
        marginBottom: 10,
    },
    footerButton: {
        width: "100%",
    },
    totals: {
        flexDirection: "row",
        alignItems: "center",
    },
});
