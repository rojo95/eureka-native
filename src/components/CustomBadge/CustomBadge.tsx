import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
    BadgeProps,
    Badge as BadgeRNP,
    DefaultTheme,
    useTheme,
} from "react-native-paper";
import { StyleProps } from "react-native-reanimated";
import Text from "../Text/Text";

/**
 * The `interface BadgeBase` is extending the `BadgeProps` interface and adding additional properties
 * to it.
 */
interface BadgeBase extends BadgeProps {
    customStyles?: StyleProps;
    icon?: ReactNode;
    colorStyle?: StyleProps;
}

/**
 * The `interface BadgeWithIcon` is extending the `BadgeBase` interface and specifying that shoudn't have icon or colorStyle
 */
interface BadgeWithIcon extends BadgeBase {
    icon?: never;
    colorStyle?: never;
}

/**
 * The `BadgeWithoutIcon` interface extends the `BadgeBase` interface and specifies that if the icon exists, the colorStyle may not exist.
 */
interface BadgeWithoutIcon extends BadgeBase {
    icon: ReactNode;
    colorStyle?: StyleProps;
}

/**
 * the type Badge can be like a BadgeWithIcon or a BadgeWithoutIcon interface
 */
type Badge = BadgeWithIcon | BadgeWithoutIcon;

const CustomBadge: React.FC<Badge> = ({
    children,
    customStyles,
    onPress,
    icon,
    colorStyle,
}) => {
    const theme: DefaultTheme = useTheme();
    return (
        <View style={styles.badgeContainer}>
            {icon ? (
                <Pressable
                    onPress={onPress}
                    style={[
                        {
                            backgroundColor: theme.colors.primary,
                            flexDirection: "row",
                            alignItems: "center",
                        },
                        styles.badge,
                        customStyles,
                    ]}
                >
                    <Text style={colorStyle}>{children} </Text>
                    {icon}
                </Pressable>
            ) : (
                <BadgeRNP
                    style={[
                        styles.badge,
                        { backgroundColor: theme.colors.primary },
                        customStyles,
                    ]}
                    onPress={onPress}
                >
                    {children}
                </BadgeRNP>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    badgeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    badge: {
        marginRight: 8,
    },
});

export default CustomBadge;
