import {
    StyleSheet,
    TouchableOpacityProps,
    View,
    TouchableOpacity,
} from "react-native";
import Text from "components/Text/Text";
import { ActivityIndicator, DefaultTheme, useTheme } from "react-native-paper";
import CustomBadge from "components/CustomBadge/CustomBadge";
import { formatPrices } from "utils/numbers";
import { useContext, useMemo } from "react";
import { getColorState } from "../../utils/utils";
import { UserContext } from "contexts/UserContext";

interface BudgetsCard extends TouchableOpacityProps {
    number?: string;
    title: string;
    state: { id: number; name: string };
    totalCost: number;
    totalSale: number;
    onPress?: () => void;
}

const BudgetsCard = ({
    number,
    title,
    state,
    totalCost,
    totalSale,
    onPress,
}: BudgetsCard) => {
    const { language } = useContext(UserContext);
    const theme: DefaultTheme = useTheme();

    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.primaryContrast,
        },
        title: {
            color: theme.colors.dark,
        },
        code: {
            color: theme.colors.codeColor,
        },
        totalCost: {
            color: theme.colors.danger,
        },
        totalSale: {
            color: theme.colors.success,
        },
    });

    const formattedTotalCost = useMemo(() => {
        return formatPrices({ number: totalCost || 0, language });
    }, [totalCost, language]);

    const formattedTotalSale = useMemo(() => {
        return formatPrices({ number: totalSale || 0, language });
    }, [totalSale, language]);

    return (
        <TouchableOpacity
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            onPress={onPress}
        >
            <View style={[styles.container, themedStyles.container]}>
                <View style={[styles.content]}>
                    <View>
                        <Text style={[styles.code, themedStyles.code]}>
                            {number}
                        </Text>
                    </View>
                    <Text style={[styles.bold, themedStyles.title]}>
                        {title}
                    </Text>
                    <CustomBadge
                        customStyles={{
                            backgroundColor: getColorState({
                                statusId: state.id,
                                theme,
                            }),
                            color: theme.colors.dark,
                        }}
                    >
                        {state.name}
                    </CustomBadge>
                    <Text style={[styles.number]}>
                        {formattedTotalCost === "" ? (
                            <ActivityIndicator size="small" />
                        ) : (
                            <Text>
                                <Text
                                    style={[
                                        styles.bold,
                                        themedStyles.totalCost,
                                    ]}
                                >
                                    {formattedTotalCost}€
                                </Text>{" "}
                                -{" "}
                                <Text
                                    style={[
                                        styles.bold,
                                        themedStyles.totalSale,
                                    ]}
                                >
                                    {formattedTotalSale}€
                                </Text>
                            </Text>
                        )}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default BudgetsCard;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderTopLeftRadius: 0,
        borderBottomStartRadius: 0,
        borderRadius: 10,
        overflow: "hidden",
        shadowColor: "#000",
        elevation: 5,
        marginVertical: 10,
        marginEnd: 10,
        alignSelf: "center",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 18,
        marginBottom: 8,
    },
    number: {
        fontSize: 14,
        textAlign: "right",
    },
    code: {
        fontSize: 14,
    },
    bold: {
        fontWeight: "bold",
    },
});
