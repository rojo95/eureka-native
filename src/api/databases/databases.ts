import axios, { AxiosResponse } from "axios";
import { getSecureData } from "services/store-data/store-data";
import sessionNames from "utils/session-info";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey, wcIdKey } = sessionNames;

export type GetDatabasesResponse = {
    id: number;
    title: string;
};

export async function getPriceDatabases(): Promise<GetDatabasesResponse[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}PriceDatabases`;
    const wcId = ((await getSecureData(wcIdKey)) || "").split(",");

    const params = { fields: ["id", "title"], where: { wcId: wcId } };

    const databases = await axios
        .get(url, {
            params: { filter: JSON.stringify(params) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<GetDatabasesResponse[]>) => {
            return response.data;
        });
    return databases;
}

export async function getArticleDatabases(): Promise<GetDatabasesResponse[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}ArticleDatabases`;
    const wcId = ((await getSecureData(wcIdKey)) || "").split(",");

    const params = { fields: ["id", "title"], where: { wcId: wcId } };

    const databases = await axios
        .get(url, {
            params: { filter: JSON.stringify(params) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<GetDatabasesResponse[]>) => {
            return response.data;
        });
    return databases;
}
