import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button, DefaultTheme, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";
import Select from "../Select/Select";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Properties alloweds to use the paginator 
 */
type PaginatorProps = {
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    labels?: boolean;
};

const Paginator: React.FC<PaginatorProps> = ({
    totalPages,
    onPageChange,
    onLimitChange,
    labels,
}) => {
    const { t } = useTranslation();
    const theme: DefaultTheme = useTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState<string>("10"); // Default limit value

    const styles = StyleSheet.create({
        topContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        bottomContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        pageText: {
            color: theme.colors.dark,
        },
        labelContainer: {
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            padding: 0,
        },
    });

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        onPageChange(page);
    };

    const handleLimitChange = (newLimit: string) => {
        setLimit(newLimit);
        onLimitChange(parseInt(newLimit, 10));
    };

    return (
        <View>
            <View style={styles.topContainer}>
                <Text>{t("row-per-page")}</Text>
                <Select
                    options={["10", "20", "50", "100"]}
                    selectedValue={limit}
                    onSelect={handleLimitChange}
                    buttonStyle={{
                        width: 90,
                        borderRadius: 100,
                        marginHorizontal: 10,
                    }}
                />
                <Text style={styles.pageText}>
                    {t("pager-page")} {currentPage} {t("pager-of")} {totalPages}
                </Text>
            </View>
            <View style={styles.bottomContainer}>
                <Button
                    onPress={() => goToPage(1)}
                    disabled={currentPage === 1}
                >
                    <MaterialIcons name="first-page" size={24} color="black" />
                </Button>
                <Button
                    onPress={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <Entypo
                        name="chevron-left"
                        size={24}
                        color={theme.colors.dark}
                    />
                </Button>
                <Button
                    onPress={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <Entypo
                        name="chevron-right"
                        size={24}
                        color={theme.colors.dark}
                    />
                </Button>
                <Button
                    onPress={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <MaterialIcons name="last-page" size={24} color="black" />
                </Button>
            </View>
            {labels && (
                <View style={styles.labelContainer}>
                    <Text>{t("pager-previous") + "   " + t("pager-next")}</Text>
                </View>
            )}
        </View>
    );
};

export default Paginator;
