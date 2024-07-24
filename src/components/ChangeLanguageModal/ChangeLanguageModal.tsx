import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { DefaultTheme, Modal, Portal, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { languageResources } from "services/languages/i18next";
import languageList from "services/languages/languagesList.json";
import { UserContext } from "contexts/UserContext";

export default function ChangeLanguageModal({
    showModal,
    onToggleModal,
}: {
    showModal: boolean;
    onToggleModal: () => void;
}) {
    const { changeLanguage } = useContext(UserContext);
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();

    const themedStyles = StyleSheet.create({
        modalTitle: {
            color: theme.colors.dark,
        },
    });

    /**
     * The function `changeLang` asynchronously changes the language and toggles a modal in a
     * TypeScript React application, handling errors with a console error.
     */
    async function changeLang(lang: string) {
        try {
            changeLanguage(lang);
            onToggleModal();
        } catch (e) {
            console.error("Error", e);
        }
    }

    return (
        <Portal>
            <Modal
                visible={showModal}
                onDismiss={onToggleModal}
                contentContainerStyle={styles.modalStyle}
            >
                <Text style={[styles.modalTitle, themedStyles.modalTitle]}>
                    {t("config-language-selection-label")}
                </Text>
                <FlatList
                    data={Object.keys(languageResources).sort()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.listButton}
                            onPress={() => changeLang(item)}
                        >
                            <Text>
                                {(languageList as any)[item]?.nativeName}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalStyle: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "flex-start",
        padding: 20,
    },
    modalTitle: {
        fontWeight: "bold",
        alignItems: "center",
    },
    listButton: {
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
});
