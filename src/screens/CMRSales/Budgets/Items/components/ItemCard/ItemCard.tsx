import {
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    Checkbox,
    DefaultTheme,
    Divider,
    Menu,
    useTheme,
} from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import { Batch, Chapter, SubBatch } from "api/budgets/budgets";
import Card from "components/Card/Card";
import { formatPrices } from "utils/numbers";
import { UserContext } from "contexts/UserContext";
import { ParamsContext } from "contexts/SharedParamsProvider";
import { useTranslation } from "react-i18next";
import {
    NOTIFICATION_TYPES,
    POSITION,
    notificationToast,
} from "services/notifications/notifications";
import { Image } from "expo-image";
import { noImage } from "utils/images";

interface ItemCard extends PressableProps {
    data: Chapter | Batch | SubBatch;
    onDelete: () => void;
    onUpdate: () => void;
    loading: boolean;
    parentRank?: string;
    activeEditing?: boolean;
    onSelect?: (id: number) => void;
}

export default function ItemCard({
    data,
    disabled,
    onLongPress,
    onDelete,
    onUpdate,
    onPress,
    loading,
    parentRank,
    activeEditing = false,
    onSelect,
}: ItemCard) {
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();
    const { language } = useContext(UserContext);
    const [visible, setVisible] = useState(false);
    const {
        contextParams: { budgetState },
    } = useContext(ParamsContext)!;
    const [selected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        if (!activeEditing) {
            setSelected(false);
        }
    }, [activeEditing]);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const formattedTotalCost = useMemo(() => {
        return formatPrices({ number: data.totalCost || 0, language });
    }, [data.totalCost, language]);

    const formattedTotalSale = useMemo(() => {
        const totalSale = "totalSale" in data ? data.totalSale : 0;
        return formatPrices({ number: totalSale, language });
    }, [data, language]);

    const stylesThemed = StyleSheet.create({
        text: {
            color: theme.colors.dark,
        },
        totalCost: {
            color: loading ? theme.colors.dangerLight : theme.colors.danger,
        },
        totalSale: {
            color: loading ? theme.colors.successLight : theme.colors.success,
        },
        rank: {
            backgroundColor: theme.colors.lightGrey,
            color: theme.colors.codeColor,
        },
        units: { color: theme.colors.darkGrey },
    });

    function handleDelete() {
        closeMenu();
        if (loading) return;
        onDelete();
    }

    function handleUpdate() {
        closeMenu();
        if (loading) return;
        onUpdate();
    }

    return (
        <Card>
            <Pressable
                onLongPress={onLongPress}
                disabled={disabled}
                onPress={onPress}
                style={styles.cardBase}
            >
                {!activeEditing && "imageUrl" in data && (
                    <Image
                        source={data.imageUrl || noImage}
                        style={styles.image}
                    />
                )}
                {activeEditing && (
                    <View
                        style={{
                            width: 40,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Checkbox
                            status={selected ? "checked" : "unchecked"}
                            onPress={() => {
                                setSelected(!selected);
                                onSelect && onSelect(data.id);
                            }}
                        />
                    </View>
                )}
                <Text style={[styles.rank, stylesThemed.rank]}>
                    {(parentRank ? `${parentRank}.` : "") + data.rank}
                </Text>
                <View style={styles.content}>
                    <Card.Body style={styles.cardBody}>
                        <View>
                            <View style={[styles.container]}>
                                <View
                                    style={{
                                        flexGrow: 1,
                                        width: "93%",
                                    }}
                                >
                                    {"code" in data && data.code?.length ? (
                                        <Text
                                            style={[
                                                stylesThemed.text,
                                                {
                                                    color: theme.colors
                                                        .codeColor,
                                                },
                                            ]}
                                        >
                                            {data.code}
                                        </Text>
                                    ) : (
                                        <></>
                                    )}
                                    <Text
                                        style={[
                                            stylesThemed.text,
                                            styles.description,
                                        ]}
                                    >
                                        {data.description}
                                    </Text>
                                </View>
                                {budgetState?.id === 1 && (
                                    <View
                                        style={{
                                            width: "7%",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <Menu
                                            visible={visible}
                                            onDismiss={() => closeMenu()}
                                            anchor={
                                                <Entypo
                                                    name="dots-three-vertical"
                                                    size={20}
                                                    color={
                                                        loading
                                                            ? theme.colors
                                                                  .primaryLight
                                                            : theme.colors
                                                                  .primary
                                                    }
                                                    onPress={() => openMenu()}
                                                />
                                            }
                                            contentStyle={{
                                                backgroundColor:
                                                    theme.colors.background,
                                            }}
                                        >
                                            <Menu.Item
                                                title={t("edit-label")}
                                                onPress={() => handleUpdate()}
                                            />
                                            <Divider />
                                            <Menu.Item
                                                title={t("duplicate")}
                                                onPress={() =>
                                                    notificationToast({
                                                        text: t(
                                                            "function-soon"
                                                        ),
                                                        type: NOTIFICATION_TYPES.DANGER,
                                                        position:
                                                            POSITION.CENTER,
                                                    })
                                                }
                                            />
                                            <Divider />
                                            <Menu.Item
                                                title={t("delete-label")}
                                                onPress={() => handleDelete()}
                                            />
                                        </Menu>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Card.Body>
                    <Card.Footer>
                        {"units" in data && (
                            <Text style={styles.number}>
                                <Text style={[stylesThemed.units]}>
                                    {data.amount!} {data.units}
                                </Text>
                            </Text>
                        )}
                        <Text style={styles.number}>
                            <Text
                                style={[
                                    styles.totalCost,
                                    stylesThemed.totalCost,
                                ]}
                            >
                                {formattedTotalCost}€
                            </Text>
                            {"totalSale" in data && (
                                <>
                                    {" "}
                                    -{" "}
                                    <Text
                                        style={[
                                            styles.totalSale,
                                            stylesThemed.totalSale,
                                        ]}
                                    >
                                        {formattedTotalSale}€
                                    </Text>
                                </>
                            )}
                        </Text>
                    </Card.Footer>
                </View>
            </Pressable>
        </Card>
    );
}

const styles = StyleSheet.create({
    image: {
        borderTopRightRadius: 20,
        width: "25%",
        height: "100%",
    },
    cardBase: { flexDirection: "row", flexWrap: "wrap" },
    content: {
        flexGrow: 1,
        width: "75%",
    },
    container: {
        flex: 1,
        width: "100%",
        alignContent: "space-between",
        flexDirection: "row",
    },
    description: {
        fontSize: 14,
        fontWeight: "bold",
    },
    rank: {
        position: "absolute",
        padding: 5,
        paddingHorizontal: 10,
        left: 0,
        fontSize: 13,
        borderTopLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    number: {
        fontSize: 14,
        textAlign: "right",
    },
    totalCost: {
        fontWeight: "bold",
    },
    totalSale: {
        fontWeight: "bold",
    },
    cardBody: {
        paddingTop: 30,
    },
});
