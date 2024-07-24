import React, { ReactNode } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacityProps,
} from "react-native";
import {
    DefaultTheme,
    Button as PaperButton,
    useTheme,
} from "react-native-paper";
import { StyleProps } from "react-native-reanimated";

export const BUTTON_TYPES = {
    PRIMARY: 1,
    SECONDARY: 2,
    LINK: 3,
} as const;

interface ButtonPropsBase extends TouchableOpacityProps {
    type?: (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];
    icon?: ReactNode | undefined;
    text?: string;
    textStyle?: StyleProps;
    buttonStyle?: StyleProps;
    children?: ReactNode;
}

// Extends the base interface to require the field 'text'.
interface WithText extends ButtonPropsBase {
    icon?: ReactNode;
    text: string;
    children?: ReactNode;
}

// Extends the base interface to require the 'children' field
interface WithChildren extends ButtonPropsBase {
    icon?: ReactNode;
    text?: string;
    children: ReactNode;
}

// Extends the base interface to require the 'icon' field
interface WithIcon extends ButtonPropsBase {
    icon: ReactNode;
    text?: string;
    children?: ReactNode;
}

type ButtonProps = WithText | WithChildren | WithIcon;

export default function Button({
    type = BUTTON_TYPES.PRIMARY,
    onPress,
    icon,
    text,
    textStyle,
    buttonStyle,
    children,
    disabled,
}: ButtonProps) {
    const theme: DefaultTheme = useTheme();

    const styles = StyleSheet.create({
        button: {
            borderColor:
                type === BUTTON_TYPES.LINK
                    ? "transparent"
                    : disabled
                    ? theme.colors.primaryLight
                    : theme.colors.primary,
            borderWidth: 1,
            backgroundColor:
                type === BUTTON_TYPES.PRIMARY
                    ? disabled
                        ? theme.colors.primaryLight
                        : theme.colors.primary
                    : type === BUTTON_TYPES.LINK
                    ? "transparent"
                    : theme.colors.primaryContrast,
            borderRadius: 5,
            width: "100%",
        },
        text: {
            color:
                type === BUTTON_TYPES.PRIMARY
                    ? theme.colors.primaryContrast
                    : disabled
                    ? theme.colors.primaryLight
                    : theme.colors.primary,
            width: "100%",
        },
    });

    if (type === BUTTON_TYPES.LINK) {
        return (
            <Pressable
                disabled={disabled}
                onPress={onPress}
                style={[styles.button, buttonStyle]}
            >
                {icon && icon}
                {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
                {children && children}
            </Pressable>
        );
    }

    return (
        <PaperButton
            style={[styles.button, buttonStyle]}
            icon={() => icon}
            onPress={onPress}
            disabled={disabled}
        >
            {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
            {children && children}
        </PaperButton>
    );
}
