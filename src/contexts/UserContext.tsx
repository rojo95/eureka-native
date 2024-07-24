import { createContext, useState, useEffect, ReactNode } from "react";
import { getData, getSecureData } from "services/store-data/store-data";
import { login as loginFn, logout as logoutFn } from "api/auth/auth";
import { getUserData } from "api/personnels/personnels";
import sessionNames from "utils/session-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "services/languages/i18next";
import { hideAsync } from "expo-splash-screen";
import {
    NOTIFICATION_TYPES,
    notificationToast,
} from "services/notifications/notifications";

const { userKey, userIdKey, langKey } = sessionNames;

type User = {
    id: number;
    rol: string;
    name: string;
    lastName: string;
};

export type Language = "es" | "en" | null;

type UserContextValue = {
    user: User | null;
    language: Language;
    login: (loginProps: LoginProps) => Promise<boolean>;
    logout: () => void;
    changeLanguage: (lang: string) => void;
};

type LoginProps = {
    email: string;
    password: string;
};

const UserContext = createContext<UserContextValue>({
    language: null,
    user: null,
    login: async (): Promise<boolean> => {
        return false;
    },
    logout: () => {},
    changeLanguage: () => {},
});

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [language, setLanguage] = useState<Language>("es");

    /**
     * function to get the user data if there is a user token and an user id
     */
    const fetchUser = async () => {
        try {
            const userKeyData = await getSecureData(userKey);
            const id = await getSecureData(userIdKey);

            if (userKeyData && id) {
                const {
                    type: rol,
                    name,
                    lastName,
                } = await getUserData({
                    userId: parseInt(id),
                });
                setUser({ id: parseInt(id), rol, name, lastName });
            }
        } catch (error) {
            notificationToast({ text: "ERROR", type: NOTIFICATION_TYPES.DANGER });
        } finally {
            hideAsync();
        }
    };

    /**
     * Fetches user and language data when the component mounts.
     */
    useEffect(() => {
        fetchUser();
        fetchLanguage();
    }, []);

    const login = async (loginProps: LoginProps) => {
        try {
            const response = await loginFn(loginProps);
            if (response) {
                const { id, type: rol, name, lastName } = response;
                setUser({ id: id, rol, name, lastName });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error loging: ", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        logoutFn();
    };

    async function changeLanguage(language: string): Promise<void> {
        try {
            await AsyncStorage.setItem(langKey, language);

            i18next.changeLanguage(language);

            setLanguage(language as Language);
        } catch (e) {
            throw e;
        }
    }

    const fetchLanguage = async () => {
        const language = ((await getData(langKey)) as Language) || "es";
        changeLanguage(language);
        setLanguage(language);
    };

    return (
        <UserContext.Provider
            value={{ user, login, logout, language, changeLanguage }}
        >
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
