import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RadioButton, Title } from "react-native-paper";
import Text from "components/Text/Text";
import Select, { Select as SelectItem } from "components/Select/Select";
import Button from "components/Button/Button";
import {
    getArticleDatabases,
    getPriceDatabases,
} from "api/databases/databases";
import { mapDatabasesToSelectOptions } from "../../utils/utils";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";

const BBDD_TYPES = {
    ARTICLES: 1,
    JOBS: 2,
};

export const TRANSACTION_TYPES = {
    EXPORT: 1,
    IMPORT: 2,
};

export type Transaction =
    (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

type Form = {
    bbddType: (typeof BBDD_TYPES)[keyof typeof BBDD_TYPES] | undefined;
    bbdd: number | undefined;
};

export default function ExportModal({
    type,
    onDismis,
}: {
    type?: Transaction;
    onDismis: () => void;
}) {
    const { t } = useTranslation();
    const [priceDatabases, setPriceDatabases] = useState<SelectItem[]>([]);
    const [articleDatabases, setArticleDatabases] = useState<SelectItem[]>([]);

    const [shoWedDDBB, setShowedDDBB] = useState<SelectItem[]>([]);

    const [form, setForm] = useState<Form>({
        bbddType: undefined,
        bbdd: undefined,
    });

    async function getDatabases() {
        const priceDDBB = mapDatabasesToSelectOptions(await getPriceDatabases());
        const articleDDBB = mapDatabasesToSelectOptions(await getArticleDatabases());

        setPriceDatabases(priceDDBB);
        setArticleDatabases(articleDDBB);
    }

    useEffect(() => {
        getDatabases();
    }, []);

    function handleForm({
        name,
        value,
    }: {
        name: string;
        value: string | number | undefined;
    }) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <View>
            <Title>
                {type === 1 ? t("export-label") : t("import-label")}{" "}
                {t("chapter-label")}
            </Title>

            <View style={styles.content}>
                <View>
                    <Text>{t("choose-db-type")}</Text>
                    <RadioButton.Group
                        onValueChange={(newValue) => {
                            setForm((prev) => ({
                                ...prev,
                                bbddType: parseInt(newValue),
                                bbdd: undefined,
                            }));

                            if (newValue === BBDD_TYPES.ARTICLES.toString()) {
                                setShowedDDBB(articleDatabases);
                            } else {
                                setShowedDDBB(priceDatabases);
                            }
                        }}
                        value={form.bbddType?.toString() || ""}
                    >
                        <View style={styles.bbDdContainer}>
                            <RadioButton.Item
                                label={t("bbdd-articles-label").toUpperCase()}
                                value={BBDD_TYPES.ARTICLES.toString()}
                            />
                            <RadioButton.Item
                                label={t("bbdd-jobs-label").toUpperCase()}
                                value={BBDD_TYPES.JOBS.toString()}
                            />
                        </View>
                    </RadioButton.Group>
                </View>
                <View style={styles.inputContainers}>
                    <Text>{t("database-label")}</Text>
                    <Select
                        options={shoWedDDBB}
                        selectedValue={form.bbdd?.toString() || ""}
                        onSelect={(val) =>
                            handleForm({ name: "bbdd", value: parseInt(val) })
                        }
                    />
                </View>
                <View style={styles.inputContainers}>
                    <Text>
                        {t("chapters-to-label")}{" "}
                        {t(
                            type === TRANSACTION_TYPES.EXPORT
                                ? "export-label"
                                : "import-label"
                        )}
                    </Text>
                    <Select
                        disabled={true}
                        options={[
                            { id: "1", description: "Opcion 1" },
                            { id: "2", description: "Opcion 2" },
                        ]}
                        selectedValue={""}
                        onSelect={() =>
                            notificationToast({
                                text: t("function-soon"),
                                type: NOTIFICATION_TYPES.DANGER,
                            })
                        }
                    />
                </View>
                <View style={styles.inputContainers}>
                    <Button
                        text={t(
                            type === TRANSACTION_TYPES.EXPORT
                                ? "export-label"
                                : "import-label"
                        )}
                        onPress={() => {
                            notificationToast({
                                text: t("function-soon"),
                                type: NOTIFICATION_TYPES.DANGER,
                            });
                            onDismis();
                        }}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        marginTop: 15,
    },
    bbDdContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    inputContainers: {
        marginVertical: 10,
    },
});
