import axios, { AxiosResponse } from "axios";
import sessionNames from "utils/session-info";
import { getUserData } from "../personnels/personnels";
import {
    deleteSecureData,
    saveSecureData,
} from "services/store-data/store-data";

const { roleKey, userKey, userIdKey, wcIdKey } = sessionNames;

/**
 * The above type defines the props required for a login component, including email and password
 * fields.
 */
export type LoginProps = {
    email: string;
    password: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * The function `login` makes a POST request to a login endpoint, processes the response
 * data, and saves relevant user information securely.
 */
type LoginResponse = {
    id: number;
    type: string;
    name: string;
    lastName: string;
    userId: number;
};

export async function login({
    email,
    password,
}: LoginProps): Promise<LoginResponse> {
    const usr = email.trim();
    const pass = password.trim();
    const loginResponse = await axios
        .post(
            `${API_URL}personnels/login`,
            {
                email: usr,
                password: pass,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        .then(async (response: AxiosResponse<LoginResponse>) => {
            const { id, userId } = response.data;
            await saveSecureData({ key: userKey, value: id.toString() });
            await saveSecureData({
                key: userIdKey,
                value: userId.toString(),
            });

            const { type, name, lastName, wcId } = await getUserData({
                userId: userId,
            });

            await saveSecureData({ key: roleKey, value: type });
            await saveSecureData({ key: wcIdKey, value: wcId.toString() });

            return { id: userId, type, name, lastName, userId: id };
        });
    return loginResponse;
}

/**
 * The `logout` function asynchronously deletes secure data associated with session names and returns a
 * success status.
 */
export async function logout(): Promise<{ success: true }> {
    try {
        Object.entries(sessionNames).map(async (v) => {
            await deleteSecureData(v[1]);
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
}

export default login;
