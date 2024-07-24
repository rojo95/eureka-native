import { FC, useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTranslation } from "react-i18next";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { DefaultTheme, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Budgets from "screens/CMRSales/Budgets/Budgets";
import HomeScreen from "screens/Home/Home";
import Configs from "screens/Configs/Configs";
import LoginScreen from "screens/Login/Login";
import { UserContext } from "../UserContext";
import Items from "screens/CMRSales/Budgets/Items/Items";
import DetailsBudget from "screens/CMRSales/Budgets/DetailsBudget/DetailsBudget";
import Tracking from "screens/CMRSales/Budgets/Tracking/Tracking";
import Attachments from "screens/CMRSales/Budgets/Attachments/Attachments";
import RightDrawerScreen from "./RightDrawerScreen";
import CustomDrawer from "./CustomDrawer";

const LeftDrawer = createDrawerNavigator();

export default function LeftDrawerScreen() {
    const { t } = useTranslation();
    const navigation: any = useNavigation();
    const theme: DefaultTheme = useTheme();
    const { user } = useContext(UserContext);

    /**
     * add the right drawer menu context to the Budget Component used as a screen
     */
    const BudgetsScreen: FC = () => (
        <RightDrawerScreen>
            <Budgets />
        </RightDrawerScreen>
    );

    /**
     * create views grouping by a navigation tab
     */
    const BudgetsDetailsTabs: FC<any> = () => {
        const Tab = createBottomTabNavigator();
        const tabs = [
            {
                name: "budget-details",
                component: DetailsBudget,
                options: {
                    title: t("information-label"),
                    headerShown: false,
                    tabBarIcon: () => (
                        <Feather name="info" size={24} color="black" />
                    ),
                },
            },
            {
                name: "budget-chapter",
                component: Items,
                options: {
                    title: t("chapters-label"),
                    headerShown: false,
                    tabBarIcon: () => (
                        <MaterialCommunityIcons
                            name="clipboard-text"
                            size={24}
                            color="black"
                        />
                    ),
                },
            },
            {
                name: "budget-files",
                component: Attachments,
                options: {
                    title: t("attachments-label"),
                    headerShown: false,
                    tabBarIcon: () => (
                        <MaterialIcons
                            name="file-copy"
                            size={24}
                            color="black"
                        />
                    ),
                },
            },
            {
                name: "budget-tracking",
                component: Tracking,
                options: {
                    title: t("tracking-label"),
                    headerShown: false,
                    tabBarIcon: () => (
                        <Feather name="list" size={24} color="black" />
                    ),
                },
            },
        ];
        return (
            <RightDrawerScreen>
                <Tab.Navigator screenOptions={{ headerShown: false }}>
                    {tabs.map((tab) => (
                        <Tab.Screen
                            key={tab.name}
                            name={tab.name}
                            component={tab.component}
                            options={tab.options}
                        />
                    ))}
                </Tab.Navigator>
            </RightDrawerScreen>
        );
    };

    return (
        <LeftDrawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            initialRouteName={"home"}
            screenOptions={{
                drawerPosition: "left",
                drawerStyle: {
                    backgroundColor: theme.colors.darkGrey,
                },
                headerShown: false,
            }}
            backBehavior="history"
        >
            {user ? (
                <>
                    <LeftDrawer.Screen
                        name="home"
                        component={HomeScreen}
                        options={{ title: t("menu-title-home") }}
                    />
                    <LeftDrawer.Screen
                        name="budgets"
                        component={BudgetsScreen}
                        options={{
                            title: t("menu-title-budgets"),
                            headerRight: () => (
                                <FontAwesome
                                    name="filter"
                                    size={24}
                                    color="black"
                                />
                            ),
                        }}
                    />
                    <LeftDrawer.Screen
                        name="budget"
                        component={BudgetsDetailsTabs}
                        options={{
                            title: t("menu-title-budgets"),
                            headerRight: () => (
                                <Entypo
                                    name="dots-three-horizontal"
                                    size={24}
                                    color="black"
                                />
                            ),
                        }}
                    />
                    <LeftDrawer.Screen
                        name="configs"
                        component={Configs}
                        options={{ title: t("menu-title-config") }}
                    />
                </>
            ) : (
                <LeftDrawer.Screen
                    name="login"
                    options={{
                        swipeEnabled: false,
                        title: t("button-login"),
                        headerRight: () => (
                            <FontAwesome
                                onPress={() => navigation.navigate("budgets")}
                                name="arrow-left"
                                size={24}
                                color={theme.colors.dark}
                            />
                        ),
                    }}
                    component={LoginScreen}
                />
            )}
        </LeftDrawer.Navigator>
    );
}
