import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
    Menu,
    Button,
    DefaultTheme,
    useTheme,
    TextInputProps,
} from "react-native-paper";
import { StyleProps } from "react-native-reanimated";
import Text from "../Text/Text";
import { useTranslation } from "react-i18next";

export type Select = { id: string; description: string };

/**
 * SelectComponent type is the properties to use the Select Component.
 */
interface SelectComponent extends TextInputProps {
    options: string[] | Select[];
    onSelect: (value: string) => void;
    selectedValue: string;
    buttonStyle?: StyleProps;
    placeholder?: string;
    label?: string;
}

const Select: React.FC<SelectComponent> = ({
    disabled,
    options,
    onSelect,
    selectedValue,
    buttonStyle,
    placeholder,
    label,
}) => {
    const { t } = useTranslation();
    const placeHolder = placeholder || t("select-list-item");
    const theme: DefaultTheme = useTheme();
    const [visible, setVisible] = useState(false);
    const [items, setItems] = useState<string[] | Select[]>([]);

    useEffect(() => {
        setItems(options);
    }, [options]);

    const themedStyles = StyleSheet.create({
        text: {
            color: disabled ? theme.colors.deepBlueLight : theme.colors.dark,
        },
        fieldLabel: {
            backgroundColor: theme.colors.primaryContrast,
        },
    });

    const openMenu = () => {
        !disabled && setVisible(true);
    };
    const closeMenu = () => {
        !disabled && setVisible(false);
    };

    return (
        <View style={[styles.container, buttonStyle]}>
            {label && (
                <Text style={[styles.fieldLabel, themedStyles.fieldLabel]}>
                    {label}
                </Text>
            )}
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button
                        onPress={openMenu}
                        contentStyle={[styles.button, buttonStyle, ,]}
                        icon={!visible ? "chevron-down" : "chevron-up"}
                    >
                        <Text style={[styles.text, themedStyles.text]}>
                            {(typeof items[0] === "string"
                                ? selectedValue
                                : (
                                      items as {
                                          id: string;
                                          description: string;
                                      }[]
                                )?.find((v) => v.id === selectedValue)
                                    ?.description || selectedValue) ||
                                placeHolder}
                        </Text>
                    </Button>
                }
                contentStyle={{
                    backgroundColor: theme.colors.background,
                }}
            >
                <Menu.Item title={placeHolder} />
                {items.map((option, index) => (
                    <Menu.Item
                        key={index}
                        onPress={() => {
                            onSelect(
                                typeof option === "string" ? option : option.id
                            );
                            closeMenu();
                        }}
                        title={
                            typeof option === "string"
                                ? option
                                : option.description
                        }
                    />
                ))}
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
    },
    container: {
        marginTop: 6,
        flexGrow: 1,
        borderWidth: 1,
        borderColor: "#878787",
        borderRadius: 5,
        height: 50,
        backgroundColor: "#fff",
    },
    button: {
        flexGrow: 1,
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        height: 50,
    },
    fieldLabel: {
        position: "absolute",
        top: -9,
        left: 8,
        paddingHorizontal: 5,
        fontSize: 12,
    },
});

export default Select;
