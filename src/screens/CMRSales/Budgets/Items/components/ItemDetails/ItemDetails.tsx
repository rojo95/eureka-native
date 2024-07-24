import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, DefaultTheme, useTheme } from "react-native-paper";
import { Feather } from "@expo/vector-icons";

import { Batch, Chapter } from "api/budgets/budgets";
import { ITEM_TYPES } from "../../constants";
import { Image } from "expo-image";
import Button, { BUTTON_TYPES } from "components/Button/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { formatPrices } from "utils/numbers";
import { UserContext } from "contexts/UserContext";
import { noImage } from "utils/images";
import { NOTIFICATION_TYPES, notificationToast, POSITION } from "services/notifications/notifications";

export type ShownItem = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

export default function ItemDetails({
    details,
    itemType,
}: {
    details: Batch | Chapter;
    itemType: ShownItem;
}) {
    const theme: DefaultTheme = useTheme();
    const { width, height } = useWindowDimensions();
    const { t } = useTranslation();
    const { language } = useContext(UserContext);

    const themedStyles = StyleSheet.create({
        container: {
            width: width > height ? "40%" : "100%",
            paddingBottom: width > height ? 100 : 0,
        },
        detailsContainer: {
            flex: 1,
        },
        scrollView: {
            width: "100%",
            ...(width > height && { marginBottom: 100 }),
            flex: 1,
        },
        details: {
            paddingHorizontal: width < height ? 40 : 0,
        },
    });

    return (
        <View style={themedStyles.container}>
            <ScrollView>
                <View
                    style={[
                        styles.detailsContainer,
                        themedStyles.detailsContainer,
                    ]}
                >
                    {itemType !== ITEM_TYPES.CHAPTER &&
                    "imageUrl" in details && (
                        <Image
                            source={details.imageUrl || noImage}
                            style={{
                                width: "100%",
                                height: 200,
                            }}
                        />
                    )}
                    <View
                        style={{
                            width: "100%",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            ...(itemType !== ITEM_TYPES.CHAPTER && {
                                marginTop: -15,
                            }),
                        }}
                    >
                        <Button
                            buttonStyle={{
                                padding: 5,
                                backgroundColor: theme.colors.primary,
                                width: "auto",
                            }}
                            type={BUTTON_TYPES.LINK}
                            icon={
                                <MaterialIcons
                                    name="edit"
                                    size={24}
                                    color="white"
                                />
                            }
                            onPress={() => notificationToast({text: t("function-soon"), type: NOTIFICATION_TYPES.DANGER, position: POSITION.CENTER})}
                        />
                    </View>
                    <ScrollView style={themedStyles.scrollView}>
                        <View style={styles.descriptionContainer}>
                            <View
                                style={{
                                    width: "90%",
                                }}
                            >
                                {"code" in details && (
                                    <Text
                                        style={{
                                            fontSize: 18,
                                            color: theme.colors.codeColor,
                                        }}
                                    >
                                        {details?.code!}
                                    </Text>
                                )}
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {details?.description?.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.details, themedStyles.details]}>
                            {itemType === ITEM_TYPES.CHAPTER ? (
                                <>
                                    {"kMat" in details && (
                                        <>
                                            <View
                                                style={{
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Kmat
                                                </Text>
                                                <Text style={{ fontSize: 16 }}>
                                                    {formatPrices({
                                                        number:
                                                            details?.kMat || 0,
                                                        language,
                                                    })}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Ksub
                                                </Text>
                                                <Text style={{ fontSize: 16 }}>
                                                    {formatPrices({
                                                        number:
                                                            details?.kOut || 0,
                                                        language,
                                                    })}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Kmo
                                                </Text>
                                                <Text style={{ fontSize: 16 }}>
                                                    {formatPrices({
                                                        number:
                                                            details?.kMo || 0,
                                                        language,
                                                    })}
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {"saleDiscount" in details && (
                                        <View
                                            style={{
                                                alignItems: "center",
                                            }}
                                        >
                                            <Avatar.Icon
                                                size={45}
                                                style={{
                                                    backgroundColor:
                                                        theme.colors.background,
                                                    borderWidth: 3,
                                                }}
                                                color={theme.colors.dark}
                                                icon="percent"
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                }}
                                            >
                                                {formatPrices({
                                                    number:
                                                        details?.saleDiscount ||
                                                        0,
                                                    language,
                                                })}{" "}
                                                %
                                            </Text>
                                        </View>
                                    )}
                                    <View
                                        style={{
                                            width:
                                                "coefficient" in details
                                                    ? 0
                                                    : "100%",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Image
                                            source={require("assets/avatar-pending.jpg")}
                                            style={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 100,
                                            }}
                                        />
                                    </View>
                                    {"coefficient" in details && (
                                        <View
                                            style={{
                                                alignItems: "center",
                                            }}
                                        >
                                            <Feather
                                                name="pie-chart"
                                                size={45}
                                                color="black"
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                K {t("batch-label")}
                                            </Text>
                                            <Text style={{ fontSize: 16 }}>
                                                {formatPrices({
                                                    number:
                                                        details?.coefficient! ||
                                                        0,
                                                    language,
                                                })}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    detailsContainer: {
        alignItems: "center",
        paddingHorizontal: 10,
        width: "100%",
    },
    descriptionContainer: {
        width: "100%",
        justifyContent: "space-between",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
    },
    details: {
        marginVertical: 10,
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
});
