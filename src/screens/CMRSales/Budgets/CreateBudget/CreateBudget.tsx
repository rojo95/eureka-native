import React, { useState } from "react";
import {
    Platform,
    PlatformOSType,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { DefaultTheme, TextInput, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Select from "components/Select/Select";
import Button, { BUTTON_TYPES } from "components/Button/Button";
import { Fontisto } from "@expo/vector-icons";
import Map from "components/Map/Map";

type formData = {
    name: string;
    responsible: string;
    location: string;
    date: string;
    discount: string;
    Kmat: string;
    Ksub: string;
    Kmo: string;
    activity: string;
    iva: string;
};

export default function CreateBudget({
    data,
    onClose,
}: {
    data?: formData;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const theme: DefaultTheme = useTheme();
    const OS: PlatformOSType = Platform.OS;
    const f = new Date();

    const [formData, setFormData] = useState<formData>(
        data || {
            name: "",
            responsible: "",
            location: "",
            date:
                f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear(),
            discount: "0.0",
            Kmat: "",
            Ksub: "",
            Kmo: "",
            activity: "",
            iva: "",
        }
    );

    /**
     * function to update the form data
     */
    function handleData({ name, value }: { name: string; value: any }) {
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    }

    function handleSelection({ value, name }: { value: string; name: string }) {
        handleData({ name, value });
    }

    const styles = StyleSheet.create({
        container: {
            ...(OS === "web" && { width: 500 }),
        },
        formText: {
            marginHorizontal: 10,
        },
        input: {
            marginVertical: 5,
        },
        k: {
            flexDirection: "row",
            flex: 1,
            width: "100%",
            justifyContent: "space-between",
        },
        kStyles: { width: "32%" },
        percents: { width: "49%" },
        title: { fontWeight: "bold", color: theme.colors.dark, fontSize: 20 },
        titleContainer: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
        },
    });

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        {t("menu-title-create-budget")}
                    </Text>
                    <View>
                        <Button
                            type={BUTTON_TYPES.LINK}
                            onPress={onClose}
                            icon={
                                <Fontisto
                                    name="close"
                                    size={24}
                                    color={theme.colors.dark}
                                />
                            }
                        />
                    </View>
                </View>
                <View style={styles.formText}>
                    <TextInput
                        mode="outlined"
                        label={t("label-name")}
                        value={formData.name}
                        onChangeText={(text) =>
                            handleData({ name: "name", value: text })
                        }
                        style={styles.input}
                    />
                    <Select
                        label={t("responsible-label")}
                        placeholder={t("placeholder-select-responsible")}
                        options={[
                            { id: "1", description: "Opcion 1" },
                            { id: "2", description: "Opcion 2" },
                        ]}
                        selectedValue={formData.responsible}
                        onSelect={(text) =>
                            handleSelection({
                                value: text,
                                name: "responsible",
                            })
                        }
                        buttonStyle={styles.input}
                    />
                    <Select
                        label={t("activity-label")}
                        placeholder={t("placeholder-select-activity")}
                        options={[
                            { id: "1", description: "Opcion 1" },
                            { id: "2", description: "Opcion 2" },
                        ]}
                        selectedValue={formData.activity}
                        onSelect={(text) =>
                            handleSelection({ value: text, name: "activity" })
                        }
                        buttonStyle={styles.input}
                    />
                    <Select
                        label={t("client-label")}
                        placeholder={t("placeholder-select-client")}
                        options={[
                            { id: "1", description: "Opcion 1" },
                            { id: "2", description: "Opcion 2" },
                        ]}
                        selectedValue={formData.responsible}
                        onSelect={(text) =>
                            handleSelection({
                                value: text,
                                name: "client",
                            })
                        }
                        buttonStyle={styles.input}
                    />
                    <View style={styles.input}>
                        <Button
                            type={BUTTON_TYPES.SECONDARY}
                            text={t("label-create-cliente")}
                        />
                    </View>
                    <View style={styles.k}>
                        <TextInput
                            mode="outlined"
                            label="Kmat"
                            onChangeText={(text) =>
                                handleData({
                                    name: "Kmat",
                                    value: parseFloat(text),
                                })
                            }
                            value={formData.Kmat}
                            style={[styles.input, styles.kStyles]}
                        />
                        <TextInput
                            mode="outlined"
                            label="Ksub"
                            onChangeText={(text) =>
                                handleData({
                                    name: "Ksub",
                                    value: parseFloat(text),
                                })
                            }
                            value={formData.Ksub}
                            style={[styles.input, styles.kStyles]}
                        />
                        <TextInput
                            mode="outlined"
                            label="Kmo"
                            onChangeText={(text) =>
                                handleData({
                                    name: "Kmo",
                                    value: parseFloat(text),
                                })
                            }
                            value={formData.Kmo}
                            style={[styles.input, styles.kStyles]}
                        />
                    </View>
                    <View style={styles.k}>
                        <TextInput
                            mode="outlined"
                            label="IVA"
                            style={[styles.input, styles.percents]}
                            onChangeText={(text) =>
                                handleData({
                                    name: "IVA",
                                    value: parseFloat(text),
                                })
                            }
                            value={formData.iva}
                        />
                        <TextInput
                            mode="outlined"
                            label={t("label-discount")}
                            value={formData.discount}
                            onChangeText={(text) =>
                                handleData({
                                    name: "discount",
                                    value: parseFloat(text),
                                })
                            }
                            style={[styles.input, styles.percents]}
                        />
                    </View>
                    <View style={styles.k}>
                        <TextInput
                            mode="outlined"
                            label={t("label-date")}
                            value={formData.date}
                            style={[styles.input, styles.percents]}
                            onChangeText={(text) =>
                                handleData({ name: "date", value: text })
                            }
                        />
                    </View>
                    <View>
                        <TextInput
                            mode="outlined"
                            label={t("label-ubication")}
                            value={formData.location}
                            onChangeText={(text) =>
                                handleData({ name: "location", value: text })
                            }
                            style={[styles.input]}
                        />
                    </View>
                </View>
                {
                    <View style={[styles.input]}>
                        <Map />
                    </View>
                }
                <View style={styles.formText}>
                    <Button
                        text={t("create-budget-button")}
                        buttonStyle={styles.input}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
