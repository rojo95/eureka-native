import axios, { AxiosResponse } from "axios";
import { getSecureData } from "services/store-data/store-data";
import sessionNames from "utils/session-info";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey, wcIdKey } = sessionNames;

export type Provider = {
    businessName: string;
    cif: string;
    code: string;
    id: number;
    name: string;
};

/**
 * This function retrieves detailed personnel data for a specific user ID using an API
 * endpoint with authorization.
 */
export async function getProviders(): Promise<Provider[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Providers`;
    const wcId = ((await getSecureData(wcIdKey)) || "").split(",");

    const filters = { where: { wcId } };

    const providers = await axios
        .get(url, {
            params: { filter: JSON.stringify(filters) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Provider[]>) => {
            return response.data;
        });

    return providers;
}
