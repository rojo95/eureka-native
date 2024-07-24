import { StyleSheet, TouchableOpacity, View, ViewProps } from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { noImage } from "utils/images";
import { usePermissions } from "expo-media-library";
import { launchImageLibraryAsync } from "expo-image-picker";
import Text from "components/Text/Text";
import { DefaultTheme, useTheme } from "react-native-paper";

interface ImageView extends ViewProps {
    title?: string;
    label?: string;
    imageUrl?: string | undefined;
    onChanged?: () => void;
}

export const FormImageComponent = (
    { imageUrl, onChanged, title, label }: ImageView,
    ref: React.Ref<Image>
) => {
    const theme: DefaultTheme = useTheme();
    const [selectedImage, setSelectedImage] = useState<string | undefined>(
        imageUrl
    );
    const [status, requestPermission] = usePermissions();

    useEffect(() => {
        setSelectedImage(imageUrl);
    }, [imageUrl]);

    async function pickImage() {
        if (status === null) {
            requestPermission();
        }

        const result = await launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setSelectedImage(uri);
            onChanged && onChanged();
        }
    }

    return (
        <TouchableOpacity onPress={pickImage}>
            <View style={styles.imageContainer}>
                <Image
                    source={
                        selectedImage
                            ? {
                                uri: selectedImage,
                            }
                            : noImage
                    }
                    contentFit="cover"
                    style={styles.image}
                    transition={400}
                    ref={ref}
                />
                {title && (
                    <View style={styles.absolute}>
                        <View
                            style={[
                                styles.absolute,
                                styles.labelBar,
                                {
                                    backgroundColor: theme.colors.dark,
                                },
                            ]}
                        />
                        <View style={[styles.absolute, styles.textContainer]}>
                            <Text style={styles.text}>{title}</Text>
                        </View>
                    </View>
                )}
                {label && (
                    <View
                        style={[
                            styles.absolute,
                            {
                                bottom: 40,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.absolute,
                                styles.labelBar,
                                {
                                    backgroundColor: theme.colors.dark,
                                },
                            ]}
                        />
                        <View style={[styles.absolute, styles.textContainer]}>
                            <Text style={styles.text}>{label}</Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const FormImage = React.forwardRef<Image, ImageView>(FormImageComponent);

export default FormImage;

const styles = StyleSheet.create({
    imageContainer: {
        overflow: "hidden",
        borderRadius: 10,
        position: "relative",
    },
    image: {
        borderRadius: 10,
        width: 300,
        height: 300,
    },
    absolute: { position: "absolute" },
    labelBar: { alignItems: "center", width: 300, opacity: 0.4, height: 40 },
    textContainer: {
        alignItems: "center",
        width: 300,
        justifyContent: "center",
        height: 40,
    },
    text: {
        color: "#fff",
        fontWeight: "bold",
    },
});
