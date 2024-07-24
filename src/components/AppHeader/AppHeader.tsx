import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ChangeLanguageModal from "../ChangeLanguageModal/ChangeLanguageModal";
import Button, { BUTTON_TYPES } from "../Button/Button";

export type HeaderActions = { icon: string; onPress?: () => void };

export default function AppHeader({
    title,
    actions,
    subtitle,
    subtitleAction,
}: {
    title: string;
    actions?: HeaderActions[];
    subtitle?: string;
    subtitleAction?: { text: string; onAction: () => void }[];
}) {
    const navigation: any = useNavigation();
    const [showModal, setShowModal] = useState<boolean>(false);

    return (
        <View>
            <ChangeLanguageModal
                showModal={showModal}
                onToggleModal={() => setShowModal(!showModal)}
            />
            <Appbar.Header style={styles.container}>
                <Appbar.Action
                    icon="menu"
                    onPress={() => navigation.openDrawer()}
                />
                <Appbar.Content title={title} />
                <Appbar.Action
                    icon="earth"
                    onPress={() => setShowModal(!showModal)}
                />
                {actions &&
                    actions.map((v, k) => (
                        <Appbar.Action
                            key={k}
                            icon={v.icon}
                            onPress={v.onPress}
                        />
                    ))}
            </Appbar.Header>
            {subtitle && (
                <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                    <View>
                        {subtitleAction &&
                            subtitleAction.map((v, k) => (
                                <Button
                                    key={k}
                                    buttonStyle={{
                                        paddingLeft: 10,
                                        paddingVertical: 10,
                                    }}
                                    text={v.text}
                                    type={BUTTON_TYPES.LINK}
                                    onPress={v.onAction}
                                ></Button>
                            ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: "#FFF" },
    title: { color: "white", fontWeight: "bold" },
    subtitleContainer: {
        paddingHorizontal: 24,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    subtitle: {
        fontSize: 19,
    },
});
