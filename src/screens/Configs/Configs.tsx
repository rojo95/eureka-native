import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { DefaultTheme, useTheme } from "react-native-paper";
import { Fontisto } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Button, { BUTTON_TYPES } from "components/Button/Button";
import AppHeader from "components/AppHeader/AppHeader";
import ChangeLanguageModal from "components/ChangeLanguageModal/ChangeLanguageModal";

export default function Configs() {
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
        },
    });

    function toggleModal(): void {
        setShowModal(!showModal);
    }

    return (
        <View style={{ flex: 1 }}>
            <View>
                <AppHeader title={t("menu-title-config")} />
            </View>
            <View style={styles.container}>
                <ChangeLanguageModal
                    showModal={showModal}
                    onToggleModal={toggleModal}
                />
                <Button
                    onPress={toggleModal}
                    type={BUTTON_TYPES.SECONDARY}
                    icon={
                        <Fontisto
                            name="world-o"
                            size={24}
                            color={theme.colors.primary}
                        />
                    }
                    text={t("config-language-button")}
                />
            </View>
        </View>
    );
}
