import React, { useContext, useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DefaultTheme, useTheme } from "react-native-paper";
import { UserContext } from "../UserContext";

export default function CustomDrawer(props: any) {
    const { logout } = useContext(UserContext);
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * show the current route
     */
    const getCurrentRouteName = () => {
        const route =
            props.navigation.getState().routes[
                props.navigation.getState().index
            ];
        return route.name;
    };

    /**
     * check if the passed name is the active route
     */
    function isActiveRoute(name: string) {
        const active = name.split(",").includes(getCurrentRouteName());
        return active;
    }

    return (
        <DrawerContentScrollView {...props}>
            <View>
                <Pressable
                    onPress={() => props.navigation.navigate("home")}
                    style={[
                        styles.item,
                        {
                            backgroundColor: isActiveRoute("home")
                                ? "#636772"
                                : theme.colors.darkGrey,
                        },
                    ]}
                >
                    <AntDesign name="home" size={24} color="white" />
                    <Text
                        style={{
                            color: theme.colors.primaryContrast,
                            marginLeft: 5,
                        }}
                    >
                        {t("menu-title-home")}
                    </Text>
                </Pressable>
            </View>
            <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                style={[
                    styles.item,
                    {
                        backgroundColor: isActiveRoute("budgets,budget")
                            ? "#636772"
                            : theme.colors.darkGrey,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name="view-dashboard-outline"
                    size={24}
                    color="white"
                />
                <Text
                    style={{
                        color: theme.colors.primaryContrast,
                        marginLeft: 5,
                    }}
                >
                    {t("menu-title-cmr-sales")}
                </Text>
            </Pressable>
            {isExpanded && (
                <View>
                    <Pressable
                        onPress={() => props.navigation.navigate("budgets")}
                        style={[
                            styles.itemSon,
                            {
                                backgroundColor: isActiveRoute("budgets,budget")
                                    ? "#636772"
                                    : theme.colors.darkGrey,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="calculator-variant"
                            size={24}
                            color="white"
                        />
                        <Text
                            style={{
                                color: theme.colors.primaryContrast,
                            }}
                        >
                            {t("menu-title-budgets")}
                        </Text>
                    </Pressable>
                </View>
            )}
            <View>
                <Pressable
                    onPress={() => props.navigation.navigate("configs")}
                    style={[
                        styles.item,
                        {
                            backgroundColor: isActiveRoute("configs")
                                ? "#636772"
                                : theme.colors.darkGrey,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="cog-outline"
                        size={24}
                        color="white"
                    />
                    <Text
                        style={{
                            color: theme.colors.primaryContrast,
                            marginLeft: 5,
                        }}
                    >
                        {t("menu-title-config")}
                    </Text>
                </Pressable>
            </View>
            <View>
                <Pressable
                    onPress={async () => {
                        await logout();
                        props.navigation.navigate("login");
                    }}
                    style={[styles.item]}
                >
                    <MaterialCommunityIcons
                        name="logout"
                        size={24}
                        color="white"
                    />
                    <Text
                        style={{
                            color: theme.colors.primaryContrast,
                            marginLeft: 5,
                        }}
                    >
                        {t("logout")}
                    </Text>
                </Pressable>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        padding: 10,
        paddingLeft: 10,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    itemSon: {
        paddingVertical: 10,
        paddingLeft: 40,
        paddingRight: 5,
        flexDirection: "row",
        alignItems: "center",
    },
});
