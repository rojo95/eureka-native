import React, { FC } from "react";
import CustomBadge from "components/CustomBadge/CustomBadge";
import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { DefaultTheme, useTheme } from "react-native-paper";

/**
 * badge used into the budgets
 */
const BadgeBase: FC<{ children: string; onPress: () => void }> = ({
    children,
    onPress,
}) => {
    const theme: DefaultTheme = useTheme();
    return (
        <CustomBadge
            customStyles={styles.badge}
            onPress={onPress}
            colorStyle={{ color: theme.colors.primaryContrast }}
            icon={<FontAwesome name="close" size={15} color="white" />}
        >
            {children}
        </CustomBadge>
    );
};

export default React.memo(BadgeBase);

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
