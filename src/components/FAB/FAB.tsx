import { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import {
    FAB as FABRnp,
    IconButton,
    DefaultTheme,
    useTheme,
} from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import Text from "../Text/Text";

export type ActionProps = {
    backgroundColor?: string;
    icon: IconSource;
    label: string;
    color?: string;
    onPress: () => void;
};

type FABBase = {
    actions?: ActionProps[];
    onOpen?: () => void;
    onClose?: () => void;
    primaryIcon?: IconSource;
    secondaryIcon?: IconSource;
};

interface FABWithoutActions extends FABBase {
    actions?: ActionProps[];
    onOpen: () => void;
}

interface FABWithActions extends FABBase {
    actions: ActionProps[];
    onOpen?: () => void;
}

type FAB = FABWithoutActions | FABWithActions;

export default function FAB({
    actions,
    onOpen,
    onClose,
    primaryIcon = "plus",
    secondaryIcon = "close",
}: FAB) {
    const theme: DefaultTheme = useTheme();
    const [open, setOpen] = useState(false);
    const translations = actions?.map(() => useSharedValue(0)) || [];
    const opacities = actions?.map(() => useSharedValue(0)) || [];

    /**
     * The `openFunction` arrow function calls the `onOpen` function if it is defined.
     */
    const openFunction = () => {
        onOpen && onOpen();
    };

    /**
     * The `closeFunction` arrow function calls the `onClose` function if it is defined.
     */
    const closeFunction = () => {
        onClose && onClose();
    };

    /**
     * The `handlePress` function toggles between opening and closing a set of actions with animations
     * in a TypeScript React component.
     */
    const handlePress = () => {
        if (!actions) {
            openFunction();
        } else {
            if (open) {
                closeFunction();
                actions?.map((v, k) => {
                    translations[k].value = withTiming(0, {
                        duration: 300,
                    });
                    opacities[k].value = withTiming(0, { duration: 300 });
                });
            } else {
                !actions && openFunction();
                if (actions)
                    actions?.map((v, k) => {
                        translations[k].value = withTiming(-(k + 1) * 75, {
                            duration: 300,
                        });
                        opacities[k].value = withTiming(1, { duration: 300 });
                    });
            }
            setOpen(!open);
        }
    };

    return (
        <View style={styles.container}>
            {actions && (
                <View style={[styles.actionsContainer]}>
                    {actions
                        ?.slice()
                        .reverse()
                        .map((v, k) => {
                            const animatedStyle = useAnimatedStyle(() => {
                                return {
                                    transform: [
                                        { translateY: translations[k].value },
                                    ],
                                    opacity: opacities[k].value,
                                };
                            });
                            return (
                                <Animated.View style={[animatedStyle]} key={k}>
                                    <Pressable
                                        onPress={() => {
                                            handlePress();
                                            v?.onPress();
                                        }}
                                        style={[
                                            styles.actions,
                                            {
                                                backgroundColor:
                                                    v?.backgroundColor ||
                                                    theme.colors.primary,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={{
                                                color:
                                                    v?.color ||
                                                    theme.colors
                                                        .primaryContrast,
                                            }}
                                        >
                                            {v?.label}
                                        </Text>
                                        <IconButton
                                            iconColor={
                                                theme.colors.primaryContrast
                                            }
                                            icon={v?.icon}
                                            size={15}
                                            style={{ margin: 0 }}
                                        />
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                </View>
            )}
            <FABRnp
                style={[
                    styles.fab,
                    {
                        backgroundColor: actions
                            ? !open
                                ? theme.colors.primary
                                : theme.colors.primaryContrast
                            : theme.colors.primary,
                    },
                ]}
                icon={
                    actions ? (open ? secondaryIcon : primaryIcon) : primaryIcon
                }
                onPress={handlePress}
                color={
                    actions
                        ? !open
                            ? theme.colors.primaryContrast
                            : theme.colors.primary
                        : theme.colors.primaryContrast
                }
                rippleColor={
                    actions
                        ? !open
                            ? theme.colors.primaryContrast
                            : theme.colors.primary
                        : theme.colors.primaryContrast
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        right: 0,
        alignItems: "flex-end",
    },
    actionsContainer: {
        position: "absolute",
        top: -40,
        right: 10,
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
    actions: {
        flexDirection: "row",
        borderRadius: 100,
        alignItems: "center",
        paddingLeft: 15,
        marginVertical: 3,
    },
});
