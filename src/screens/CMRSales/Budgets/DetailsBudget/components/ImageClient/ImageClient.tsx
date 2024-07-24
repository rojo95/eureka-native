import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Button, { BUTTON_TYPES } from "components/Button/Button";
import { Client } from "api/clients/clients";
import { avatarPending } from "utils/images";

interface ImageClient extends Client {
    onCloseModal?: () => void;
}

export default function ImageClient({
    profileImage,
    name,
    personType,
    cifNif,
    onCloseModal,
}: ImageClient) {
    return (
        <>
            <Image
                source={profileImage || avatarPending}
                style={styles.image}
            />
            <LinearGradient
                colors={["#121d29", "transparent"]}
                style={styles.linearGradient}
            />
            <View style={styles.button}>
                {onCloseModal && (
                    <Button
                        onPress={onCloseModal}
                        type={BUTTON_TYPES.LINK}
                        icon={
                            <MaterialCommunityIcons
                                name="close"
                                size={20}
                                color="white"
                            />
                        }
                    />
                )}
            </View>
            <Text>{name}</Text>
            <Text
                style={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                }}
            >
                {personType}
            </Text>
            <Text>CIF/NIF: {cifNif}</Text>
        </>
    );
}

const styles = StyleSheet.create({
    linearGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 50,
    },
    button: {
        position: "absolute",
        right: 10,
        top: 10,
    },
    image: {
        width: 200,
        height: 200,
    },
});
