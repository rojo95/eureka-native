import sessionNames from "utils/session-info";
import { getSecureData } from "services/store-data/store-data";
import axios, { AxiosResponse } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey, wcIdKey } = sessionNames;

/**
 * The type `Activity` defines a structure with properties for activity type ID, ID, name, and WC ID.
 */
export type Activity = {
    activityTypeId: number;
    id: number;
    name: string;
    wcId: number;
};

/**
 * This function fetches activities data from an API based on certain criteria and returns
 * the result as a Promise.
 */
export async function getActivitiesApi(): Promise<Activity[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Activities`;
    const wcId = ((await getSecureData(wcIdKey)) || "").split(",");
    const params = {
        where: { wcId: { inq: wcId }, activityTypeId: { neq: 3 } },
        include: "activityType",
        order: "name asc",
    };

    const activities = await axios
        .get(url, {
            params: { filter: JSON.stringify(params) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Activity[]>) => {
            return response.data;
        });
    return activities;
}
