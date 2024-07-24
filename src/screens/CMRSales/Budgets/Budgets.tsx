import React, { FC, useContext, useEffect, useState } from "react";
import {
    FlatList,
    ListRenderItem,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { DefaultTheme, useTheme } from "react-native-paper";
import { TextInput } from "react-native-paper";
import BudgetsCard from "./components/BudgetsCard/BudgetsCard";
import { useTranslation } from "react-i18next";
import FAB from "components/FAB/FAB";
import Modal from "components/Modal/Modal";
import CreateBudget from "./CreateBudget/CreateBudget";
import { Budget, getBudgets } from "api/budgets/budgets";
import AppbarHeader from "components/AppHeader/AppHeader";
import { useNavigation } from "@react-navigation/native";
import { RightDrawerContext } from "contexts/navigation/RightDrawerScreen";
import Button, { BUTTON_TYPES } from "components/Button/Button";
import { DatePickerInput } from "react-native-paper-dates";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import SelectModal from "components/SelectModal/SelectModal";
import Alert, { ALERT_TYPES } from "components/Alert/Alert";
import { setDateFormat } from "utils/numbers";
import { exportBudgets } from "api/export-documents/export-documents";
import { ParamsContext } from "contexts/SharedParamsProvider";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import { UserContext } from "contexts/UserContext";
import { getBudgetStates } from "api/budget-states/budget-states";
import { getClients } from "api/clients/clients";
import { getActivitiesApi } from "api/activities/activities";
import { getResponsiblesApi } from "api/personnels/personnels";
import BadgeBase from "./components/BadgeBase/BadgeBase";

type FilterListItems = {
    id: number;
    name: string;
    lastName?: string;
    profileImage?: string;
    activityType?: { id: number; name: string };
};

type Filter = {
    client?: FilterListItems;
    state?: FilterListItems[];
    responsibles?: FilterListItems[];
    activities?: FilterListItems[];
    createdFrom?: Date;
    createdTo?: Date;
};

export default function Budgets() {
    const navigation: any = useNavigation();
    const { t } = useTranslation();
    const theme: DefaultTheme = useTheme();
    const { OS } = Platform;
    const { setContextParams } = useContext(ParamsContext)!;
    const { language } = useContext(UserContext);

    const [text, setText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalBudgets, setTotalBudgets] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);
    const [timer, setTimer] = useState<any>(null);
    const [typeModal, setTypeModal] = useState<number>(1);
    const [alert, setAlert] = useState<boolean>(false);
    const [itemsFilterItems, setFilterListItems] = useState<FilterListItems[]>(
        []
    );
    const [titleFilter, setTitleFilter] = useState<string>("");
    const [filterKey, setFilterKey] = useState("");
    const [filter, setFilter] = useState<Filter>({});

    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
    });

    // start get context right drawer
    const contextValue = useContext(RightDrawerContext);

    // Check if the context has been successfully retrieved
    if (!contextValue) {
        console.error("RightDrawerContext is not available");
        return null;
    }

    // Now TypeScript knows that contextValue is of type RightDrawerContextType
    const { onToggleOpenRight, setRightDrawerContent } = contextValue;

    // create the content to be rendered in the drawer
    const rightDrawerContent = (
        <View style={styles.drawerContainer}>
            <View>
                <Button
                    buttonStyle={styles.input}
                    type={BUTTON_TYPES.SECONDARY}
                    text={
                        filter.client
                            ? `${filter.client?.name} ${t("selected-singular")}`
                            : t("placeholder-select-client")
                    }
                    onPress={handleGetClients}
                />
                <Button
                    buttonStyle={styles.input}
                    type={BUTTON_TYPES.SECONDARY}
                    text={
                        filter.state?.length
                            ? `${filter.state?.length} ${t(
                                  "state-label"
                              )}(s) ${t("selected-plural")}`
                            : t("placeholder-select-state")
                    }
                    onPress={getStates}
                />
                <Button
                    buttonStyle={styles.input}
                    type={BUTTON_TYPES.SECONDARY}
                    text={
                        filter.responsibles?.length
                            ? `${filter.responsibles?.length} ${t(
                                  "responsible-label"
                              )}(s) ${t("selected-plural")}`
                            : t("placeholder-select-responsible")
                    }
                    onPress={getResponsibles}
                />
                <Button
                    buttonStyle={styles.input}
                    type={BUTTON_TYPES.SECONDARY}
                    text={
                        filter.activities?.length
                            ? `${filter.activities?.length} ${t(
                                  "activity-label"
                              )}(ies) ${t("selected-plural")}`
                            : t("placeholder-select-activity")
                    }
                    onPress={getActivities}
                />
                <View style={styles.inputDate}>
                    <DatePickerInput
                        style={[{ backgroundColor: "#fff" }]}
                        mode="outlined"
                        locale="en"
                        label={t("date-from")}
                        value={filter.createdFrom}
                        onChange={(d) =>
                            setFilter((prev) => ({ ...prev, createdFrom: d }))
                        }
                        inputMode="start"
                    />
                </View>
                <View style={styles.inputDate}>
                    <DatePickerInput
                        style={[{ backgroundColor: "#fff" }]}
                        mode="outlined"
                        locale="en"
                        label={t("date-to")}
                        value={filter.createdTo}
                        onChange={(d) =>
                            setFilter((prev) => ({ ...prev, createdTo: d }))
                        }
                        inputMode="start"
                    />
                </View>
            </View>
            <View>
                <View style={styles.input}>
                    <Button
                        icon={
                            <FontAwesome
                                name="trash-o"
                                size={24}
                                color="white"
                            />
                        }
                        text={t("clean-filters")}
                        onPress={() => {
                            cleanFilters();
                            onToggleOpenRight();
                        }}
                    />
                </View>
                {OS === "web" && (
                    <View style={styles.input}>
                        <Button
                            icon={
                                <FontAwesome
                                    name="cog"
                                    size={24}
                                    color="white"
                                />
                            }
                            text={t("manage-columns")}
                            onPress={() => {}}
                        />
                    </View>
                )}
            </View>
        </View>
    );
    useEffect(() => {
        // set the drawer Content
        setRightDrawerContent(rightDrawerContent);
    }, []);
    // end of the right drawer context configuration

    /**
     * Function to reset all the search parameters
     */
    function cleanFilters() {
        setText("");
        setFilter({});
    }

    /**
     * Function to fetch budgets using the setted filters
     */
    async function searchBudgets() {
        if (loading) return;

        const p = currentPage + 1;

        try {
            const filters = {
                page: p,
                limit: limit,
                ...(filter.client && { client: filter.client.id }),
                textFilter: text,
                ...(filter.activities?.length && {
                    activities: filter.activities?.map((v) => v.id),
                }),
                createdTo: filter.createdTo,
                createdFrom: filter.createdFrom,
                ...(filter.state?.length && {
                    states: filter.state?.map((v) => v.id),
                }),
                ...(filter.responsibles?.length && {
                    responsibles: filter.responsibles?.map((v) => v.id),
                }),
            };
            const { budgets, total } = await getBudgets(filters);

            setTotalBudgets(total);
            setBudgets((prevData) => [...prevData, ...budgets]);
        } catch (error) {
            console.error(error);
        }
        setCurrentPage(p);
    }

    /**
     * Fetch budgets when the component mounts or the page changes
     */
    useEffect(() => {
        setLoading(true);
        (async () => {
            await searchBudgets();
            setLoading(false);
        })();
    }, [currentPage]);

    /**
     * Handle loading more budgets when the end of the list is reached
     */
    const handleLoadMore = () => {
        if (budgets.length < totalBudgets) {
            searchBudgets();
        }
    };

    /**
     * Handle refreshing the list
     */
    const handleRefresh = () => {
        setBudgets([]);
        setCurrentPage(0);
    };

    /**
     * Function to change view to the budget detail setting the data into the context params
     */
    const handlePress = (budgetId: number) => {
        setContextParams((prev) => ({ ...prev, budgetId }));
        navigation.navigate(`budget`);
    };

    /**
     * Render an item in the list
     */
    const renderItem: ListRenderItem<Budget> = ({ item }) => (
        <BudgetsCard
            onPress={() => handlePress(item.id)}
            number={item.number}
            title={item.title}
            state={item.state}
            totalCost={item.totalCost}
            totalSale={item.totalSale}
        />
    );

    /**
     * Function to get budgets with filters .5 seconds
     * after the last change in them
     */
    useEffect(() => {
        if (timer) {
            clearTimeout(timer);
        }

        setTimer(
            setTimeout(() => {
                handleRefresh();
            }, 500)
        );
    }, [filter, text]);

    /**
     * function to get the availables clients
     */
    async function handleGetClients() {
        await getItemsForFilter({
            type: "client",
            apiFunction: getClients,
            itemFormatter: (v) => ({
                id: v.id,
                name: v.name.toUpperCase(),
            }),
        });
    }

    /**
     * function to get the availables states
     */
    function getStates() {
        getItemsForFilter({
            type: "state",
            apiFunction: getBudgetStates,
            itemFormatter: (v) => ({ id: v.id, name: v.name.toUpperCase() }),
        });
    }

    /**
     * function to get the availables responsibles
     */
    function getResponsibles() {
        getItemsForFilter({
            type: "responsibles",
            apiFunction: getResponsiblesApi,
            itemFormatter: (v) => ({
                id: v.id,
                name: `${v.name?.toUpperCase()} ${v.lastName?.toUpperCase()}`,
                profileImage: v.profileImage,
            }),
        });
    }

    /**
     * function to get the availables activities
     */
    function getActivities() {
        getItemsForFilter({
            type: "activities",
            apiFunction: getActivitiesApi,
            itemFormatter: (v) => ({
                id: v.id,
                name: `${v.name.toUpperCase()} (${v.activityType?.name.substring(
                    0,
                    3
                )}.)`,
            }),
        });
    }

    /**
     * function to change the filter
     */
    async function getItemsForFilter({
        type,
        apiFunction,
        itemFormatter,
    }: {
        type: string;
        apiFunction: () => Promise<any>;
        itemFormatter: (item: any) => FilterListItems;
    }) {
        let items: FilterListItems[] = await apiFunction();
        items = items.map(itemFormatter);
        setFilterListItems(items);
        setFilterKey(type);
        setTitleFilter(t(`placeholder-select-${type}-multiple`));
        setShowModal(true);
        setTypeModal(2);
    }

    function handleFilters(value: FilterListItems[] | FilterListItems) {
        setFilter((prev: Filter) => ({
            ...prev,
            [filterKey]: value,
        }));
    }

    /**
     * function to change the renderized component in the modal
     */
    function rendererListType(param: number) {
        switch (param) {
            case 2:
                return (
                    <SelectModal
                        title={titleFilter}
                        data={itemsFilterItems}
                        singleSelection={filterKey === "client" && true}
                        selectedValues={(filter as any)[filterKey]}
                        setSelectedValues={handleFilters}
                        onClose={() => setShowModal(false)}
                    />
                );
            default:
                return <CreateBudget onClose={() => setShowModal(false)} />;
        }
    }

    /**
     * function to remove a selected activity
     */
    function removeActivity(id: number) {
        setFilter((prev) => ({
            ...prev,
            activities: prev.activities?.filter((v) => v.id !== id),
        }));
    }

    /**
     * function to remove a selected state
     */
    function removeStates(id: number) {
        setFilter((prev) => ({
            ...prev,
            state: prev.state?.filter((v) => v.id !== id),
        }));
    }

    /**
     * function to remove a selected responsible
     */
    function removeResponsible(id: number) {
        setFilter((prev) => ({
            ...prev,
            responsibles: prev.responsibles?.filter((v) => v.id !== id),
        }));
    }

    /**
     * function to remove a selected client
     */
    function removeClients() {
        setFilter((prev) => ({
            ...prev,
            client: undefined,
        }));
    }

    async function exportListToExcel() {
        const filters = {
            ...(filter.client && { client: filter.client }),
            textFilter: text,
            ...(filter.activities?.length && {
                activities: filter.activities,
            }),
            createdTo: filter.createdTo,
            createdFrom: filter.createdFrom,
            ...(filter.state?.length && { states: filter.state }),
            ...(filter.responsibles?.length && {
                responsibles: filter.responsibles,
            }),
            translation: t,
            language,
        };

        const downloaded = await exportBudgets(filters).catch((e) => {
            return notificationToast({
                text: `${t("fail-downloading-file")}.`,
                type: NOTIFICATION_TYPES.DANGER,
            });
        });

        if (downloaded) {
            notificationToast({
                text: `${t("success-downloading-file")}.`,
                type: NOTIFICATION_TYPES.SUCCESS,
            });
        }
    }

    return (
        <View style={[themedStyles.container, styles.container]}>
            <View>
                <AppbarHeader
                    title={t("menu-title-budgets")}
                    actions={[{ icon: "filter", onPress: onToggleOpenRight }]}
                />
            </View>
            <View style={styles.containerSearch}>
                <TextInput
                    mode="outlined"
                    label={t("budgets-input-search-label")}
                    placeholder={t("budget-input-search-placeholder")}
                    value={text}
                    onChangeText={(tx) => setText(tx)}
                    right={
                        <TextInput.Icon
                            icon="magnify"
                            color={theme.colors.primary}
                        />
                    }
                />
            </View>
            <View>
                <ScrollView
                    horizontal={true}
                    style={{
                        margin: 10,
                    }}
                >
                    {filter.client && (
                        <BadgeBase onPress={removeClients}>
                            {`${t("client-label").toLowerCase()}: ${
                                filter.client.name
                            } `}
                        </BadgeBase>
                    )}
                    {filter.state &&
                        filter.state?.map((v) => (
                            <BadgeBase
                                key={v.id}
                                onPress={() => removeStates(v.id)}
                            >
                                {`${t("state-label").toLowerCase()}: ${v.name}`}
                            </BadgeBase>
                        ))}
                    {filter.responsibles &&
                        filter.responsibles.map((v) => (
                            <BadgeBase
                                key={v.id}
                                onPress={() => removeResponsible(v.id)}
                            >
                                {`${t("responsible-label").toLowerCase()}: ${
                                    v.name
                                }${v.lastName ? " " + v.lastName : ""}`}
                            </BadgeBase>
                        ))}
                    {filter.activities &&
                        filter.activities.map((v) => (
                            <BadgeBase
                                key={v.id}
                                onPress={() => removeActivity(v.id)}
                            >
                                {`${t("activity-label").toLowerCase()}: ${
                                    v.name
                                }`}
                            </BadgeBase>
                        ))}
                    {filter.createdFrom && (
                        <BadgeBase
                            onPress={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    createdFrom: undefined,
                                }))
                            }
                        >
                            {`${t("date-from").toLowerCase()}: ${setDateFormat({
                                date: new Date(filter.createdFrom),
                                language,
                            })}`}
                        </BadgeBase>
                    )}
                    {filter.createdTo && (
                        <BadgeBase
                            onPress={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    createdTo: undefined,
                                }))
                            }
                        >
                            {`${t("date-to").toLowerCase()}: ${setDateFormat({
                                date: new Date(filter.createdTo),
                                language,
                            })}`}
                        </BadgeBase>
                    )}
                </ScrollView>
            </View>

            <View style={{ marginVertical: 10, flex: 1 }}>
                <FlatList
                    data={budgets}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={loading}
                    onRefresh={handleRefresh}
                />
            </View>

            <Modal
                visible={showModal}
                onDismiss={() => setShowModal(false)}
                style={{
                    ...(OS === "web" && {
                        alignItems: "center",
                    }),
                }}
            >
                {rendererListType(typeModal)}
            </Modal>
            <View style={{ flex: 1, marginTop: "-150%" }}>
                <FAB
                    actions={[
                        {
                            icon: "plus",
                            label: t("menu-title-create-budget"),
                            onPress: () => {
                                setShowModal(!showModal);
                                setTypeModal(1);
                            },
                        },
                        {
                            icon: "file-export",
                            label: t("export"),
                            onPress: () => {
                                setAlert(true);
                            },
                        },
                    ]}
                ></FAB>
            </View>
            <Alert
                showModal={alert}
                title={t("export-list-to-excel-title")}
                onDismiss={() => setAlert(false)}
                description={t("export-list-to-excel-ask-description")}
                onAccept={exportListToExcel}
                type={ALERT_TYPES.CONFIRM}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        height: 30,
        margin: 3,
        paddingHorizontal: 7,
        paddingVertical: 5,
        borderRadius: 100,
        fontSize: 13,
    },
    container: {
        flex: 1,
    },
    containerSearch: {
        marginHorizontal: 10,
    },
    drawerContainer: {
        flex: 1,
        marginVertical: 40,
        marginHorizontal: 10,
        justifyContent: "space-between",
    },
    input: {
        marginVertical: 5,
    },
    inputDate: { marginVertical: 32 },
});
