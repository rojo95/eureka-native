import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Modal as ModalRNP, Portal } from "react-native-paper";
import { StyleProps } from "react-native-reanimated";

type Modal = {
    visible: boolean;
    children: React.ReactNode;
    onDismiss: () => void;
    style?: StyleProps;
};

export default function Modal({ visible, children, onDismiss, style }: Modal) {
    const hideModal = () => onDismiss();

    return (
        <View>
            <Portal>
                <ModalRNP
                    style={style}
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={styles.containerStyle}
                >
                    {children}
                </ModalRNP>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    containerStyle: { backgroundColor: "white", padding: 20 },
});
