import {
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Avatar,
    Checkbox,
    DefaultTheme,
    useTheme,
} from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";
import Button, { BUTTON_TYPES } from "../Button/Button";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { avatarPending } from "utils/images";

type Item = {
    id: number;
    name: string;
    profileImage?: string;
};

type SelectedValues = Item[] | Item;

type SelectModal = {
    data: Item[];
    onClose: () => void;
    selectedValues?: SelectedValues;
    setSelectedValues: (values: SelectedValues) => void;
    title: string;
    singleSelection: boolean;
};

export default function SelectModal({
    data,
    onClose,
    selectedValues = [],
    setSelectedValues,
    title,
    singleSelection,
}: SelectModal) {
    const { t } = useTranslation();
    const theme: DefaultTheme = useTheme();

    const [selected, setSelected] = useState<SelectedValues>(selectedValues);

    /**
     * Function to select multiple activities
     */
    function handleSelectItem(item: Item) {
        setSelected((prevSelected) => {
            if (!singleSelection) {
                const objectIndex = (prevSelected as Item[]).findIndex(
                    (v) => v.id === item.id
                );
                if (objectIndex === -1) {
                    return [...(prevSelected as Item[]), item];
                } else {
                    return (prevSelected as Item[]).filter(
                        (v) => v.id !== item.id
                    );
                }
            } else {
                return item;
            }
        });
    }

    /**
     * Component to render the list
     */
    const SelectListItems: ListRenderItem<Item> = ({ item }) => {
        const isSelected = Array.isArray(selected)
            ? selected.find((v) => v.id === item.id) !== undefined
            : selected.id === item.id;

        return (
            <GestureHandlerRootView>
                <TouchableOpacity
                    style={{
                        paddingVertical: 15,
                        borderBottomWidth: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    onPress={() => handleSelectItem(item)}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            maxWidth: "90%",
                        }}
                    >
                        {"profileImage" in item && (
                            <View style={{ marginRight: 5 }}>
                                <Avatar.Image
                                    size={24}
                                    source={
                                        item.profileImage
                                            ? () => (
                                                  <Image
                                                      style={{
                                                          width: 30,
                                                          height: 30,
                                                      }}
                                                      source={{
                                                          uri: item.profileImage,
                                                      }}
                                                  />
                                              )
                                            : avatarPending
                                    }
                                />
                            </View>
                        )}
                        <Text>{item.profileImage ? " " : "" + item.name}</Text>
                    </View>
                    <Checkbox status={isSelected ? "checked" : "unchecked"} />
                </TouchableOpacity>
            </GestureHandlerRootView>
        );
    };

    /**
     * function to finish the selection and return the selected objects
     */
    function finishSelection() {
        setSelectedValues(selected);
        onClose();
    }

    /**
     * check or uncheck all the items
     */
    function checkUncheckAll() {
        if (!singleSelection) {
            if (Array.isArray(selected) && selected.length >= data.length) {
                setSelected([]);
            } else {
                setSelected(data);
            }
        }
    }

    return (
        <View style={styles.formStyle}>
            {data.length > 0 ? (
                <View>
                    <View style={styles.titleContainer}>
                        <Text
                            style={[
                                styles.formTytle,
                                { color: theme.colors.dark },
                            ]}
                        >
                            {title}
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
                    {!singleSelection && (
                        <View style={styles.topButtonsContainer}>
                            <Button
                                type={BUTTON_TYPES.SECONDARY}
                                text={
                                    Array.isArray(selected) &&
                                    selected.length >= data.length
                                        ? t("uncheck-all")
                                        : t("check-all")
                                }
                                onPress={checkUncheckAll}
                            />
                        </View>
                    )}
                    <View style={{ maxHeight: "75%" }}>
                        <FlatList data={data} renderItem={SelectListItems} />
                    </View>
                    <View style={styles.button}>
                        <Button
                            onPress={finishSelection}
                            text={t("finish-selection")}
                        />
                    </View>
                </View>
            ) : (
                <View>
                    <ActivityIndicator animating={true} size={"large"} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    formStyle: {
        padding: 20,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 5,
        marginBottom: 10,
    },
    formTytle: {
        fontWeight: "bold",
    },
    button: {
        marginTop: 10,
    },
    topButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
        marginBottom: 10,
    },
});
