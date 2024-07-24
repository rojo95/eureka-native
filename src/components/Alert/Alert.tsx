import { StyleSheet, View, useWindowDimensions } from "react-native";
import React, { useCallback, useState } from "react";
import Button, { BUTTON_TYPES } from "../Button/Button";
import { Fontisto } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import Text from "../Text/Text";
import { DefaultTheme, Modal, Portal, useTheme } from "react-native-paper";
import { StyleProps } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import { isPromise } from "utils/functions";

export const ALERT_TYPES = {
    ALERT: 1,
    CONFIRM: 2,
} as const;

type Alert = (typeof ALERT_TYPES)[keyof typeof ALERT_TYPES];

export default function Alert({
    title,
    description,
    onDismiss,
    showModal,
    onAccept,
    onCancel,
    titleStyle,
    acceptButtonText,
    cancelButtonText,
    type = ALERT_TYPES.ALERT,
    showClose = true,
    enableOnDismiss = true,
}: {
    title: string;
    description?: string;
    onDismiss: () => void;
    showModal: boolean;
    onAccept?: () => Promise<void> | void;
    onCancel?: () => void;
    titleStyle?: StyleProps;
    acceptButtonText?: string;
    cancelButtonText?: string;
    type?: Alert;
    showClose?: boolean;
    enableOnDismiss?: boolean;
}) {
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();
    const [disableActions, setDisableActions] = useState<boolean>(false);
    const { width, height } = useWindowDimensions();

    /**
     * The `handleAccept` function is a callback function defined using the `useCallback` hook in
     * React. It is responsible for handling the logic when the user accepts the alert or confirmation
     * dialog.
     */
    const handleAccept = useCallback(async () => {
        if (disableActions) return;

        if (onAccept) {
            setDisableActions(true);
            const result = onAccept();

            if (isPromise(result)) {
                try {
                    await result;
                } catch (e) {
                    notificationToast({
                        type: NOTIFICATION_TYPES.DANGER,
                        text: t("fail-action"),
                    });
                    console.error(e);
                } finally {
                    setDisableActions(false);
                    onDismiss();
                }
            } else {
                onDismiss();
                setDisableActions(false);
            }
        }
    }, [disableActions, onDismiss, onAccept]);

    /**
     * The `handleClose` function defined using the `useCallback` hook in React is responsible for
     * handling the logic when the user closes the alert or confirmation dialog. Here's a breakdown of
     * what it does:
     */
    const handleClose = useCallback(() => {
        if (disableActions) return;
        onDismiss();
        if (onCancel) {
            onCancel();
        }
    }, [disableActions, onDismiss, onCancel]);

    return (
        <Portal>
            <Modal
                visible={showModal}
                onDismiss={() => enableOnDismiss && onDismiss()}
                contentContainerStyle={[
                    styles.modalStyle,
                    {
                        ...(width > height && {
                            marginHorizontal: 100,
                        }),
                    },
                ]}
            >
                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginVertical: 5,
                        }}
                    >
                        <Text
                            style={[
                                styles.modalTitle,
                                { color: theme.colors.dark },
                                titleStyle,
                            ]}
                        >
                            {title}
                        </Text>
                        {showClose && (
                            <View>
                                <Button
                                    type={BUTTON_TYPES.LINK}
                                    onPress={onDismiss}
                                    icon={
                                        <Fontisto
                                            name="close"
                                            size={24}
                                            color={theme.colors.dark}
                                        />
                                    }
                                />
                            </View>
                        )}
                    </View>
                    <Text style={styles.description}>{description}</Text>
                    <View style={styles.buttons}>
                        {type === ALERT_TYPES.CONFIRM && (
                            <View>
                                <Button
                                    text={cancelButtonText || t("cancel-label")}
                                    type={BUTTON_TYPES.SECONDARY}
                                    onPress={handleClose}
                                    disabled={disableActions}
                                    icon={
                                        <AntDesign
                                            name="close"
                                            size={20}
                                            color={
                                                disableActions
                                                    ? theme.colors.primaryLight
                                                    : theme.colors.primary
                                            }
                                        />
                                    }
                                />
                            </View>
                        )}
                        <View>
                            <Button
                                text={acceptButtonText || t("accept-label")}
                                onPress={handleAccept}
                                icon={
                                    <Entypo
                                        name="check"
                                        size={20}
                                        color={theme.colors.primaryContrast}
                                    />
                                }
                                disabled={disableActions}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalStyle: {
        backgroundColor: "white",
        justifyContent: "flex-start",
        padding: 20,
    },
    modalTitle: {
        fontWeight: "bold",
        alignItems: "center",
    },
    buttons: {
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "space-around",
        marginVertical: 5,
    },
    description: {
        marginVertical: 10,
    },
});
