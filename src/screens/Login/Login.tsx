import React, { useContext, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { DefaultTheme, TextInput, useTheme } from "react-native-paper";
import Button from "components/Button/Button";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { LoginProps } from "api/auth/auth";
import { UserContext } from "contexts/UserContext";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";
import { logoEureka } from "utils/images";

const LoginScreen = ({ navigation }: { navigation: any }) => {
    const { login } = useContext(UserContext);
    const theme: DefaultTheme = useTheme();
    const { t } = useTranslation();
    const { OS } = Platform;
    const [formData, setFormData] = useState<LoginProps>({
        email: "",
        password: "",
    });
    const [showPass, setShowPass] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const themedStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.primaryContrast,
        },
    });

    /**
     * function to handle the formulary data
     */
    function handleData({ name, value }: { name: string; value: string }) {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    /**
     * Function to log in to the app
     */
    const handleLogin = async () => {
        if (loading) return;

        const { email, password } = formData;
        if (email !== "" && password !== "") {
            setLoading(true);
            const loged = await login({ email, password })
                .catch((err) => {
                    const { status } = err;
                    let errorMsg = "";
                    if (status === 401) {
                        errorMsg = t("invalid-user-pass");
                    } else if (status === 500) {
                        errorMsg = t("server-error");
                    } else if (status === 0) {
                        errorMsg = t("network-error");
                    } else {
                        errorMsg = t("failed-login");
                    }

                    notificationToast({
                        text: errorMsg,
                        type: NOTIFICATION_TYPES.DANGER,
                    });
                    throw err;
                })
                .finally(() => setLoading(false));
            if (loged) {
                navigation.navigate("home");
            }
        } else {
            notificationToast({
                text: t("invalid-user-pass-message"),
                type: NOTIFICATION_TYPES.DANGER,
            });
        }
    };

    return (
        <View style={[styles.container, themedStyles.container]}>
            <View style={styles.formContent}>
                <View
                    style={{
                        alignItems: "center",
                    }}
                >
                    <Image
                        style={{
                            width: "100%",
                            height: OS === "web" ? 100 : 200,
                        }}
                        source={logoEureka}
                        contentFit="contain"
                    />
                </View>
                <View style={styles.input}>
                    <TextInput
                        disabled={loading}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        mode="outlined"
                        label={t("label-email")}
                        value={formData.email}
                        onChangeText={(text) =>
                            handleData({ name: "email", value: text })
                        }
                        style={styles.input}
                    />
                </View>
                <View style={styles.input}>
                    <TextInput
                        disabled={loading}
                        mode="outlined"
                        autoCapitalize="none"
                        label={t("label-password")}
                        value={formData.password}
                        secureTextEntry={!showPass}
                        {...(showPass && {
                            keyboardType: "visible-password",
                        })}
                        onChangeText={(text) =>
                            handleData({ name: "password", value: text })
                        }
                        style={styles.input}
                        right={
                            <TextInput.Icon
                                disabled={loading}
                                icon={showPass ? "eye" : "eye-off-outline"}
                                onPress={() => setShowPass(!showPass)}
                            />
                        }
                    />
                </View>
                <View style={styles.input}>
                    <Button
                        disabled={loading}
                        text={t("button-login")}
                        onPress={handleLogin}
                    />
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    input: { marginVertical: 3 },
    formContent: {
        margin: 15,
    },
    image: { flex: 1, width: "100%", backgroundColor: "#0553" },
});
