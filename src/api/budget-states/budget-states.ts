import sessionNames from "utils/session-info";
import { getSecureData } from "services/store-data/store-data";
import axios, { AxiosResponse } from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey } = sessionNames;

/**
 * The type `BudgetState` represents an object with properties `id`, `name`, and `value`, all of type
 * `number` or `string`.
 */
export type BudgetState = { id: number; name: string; value: string };

/**
 * The function `getBudgetStates` retrieves budget state data from an API using a secure authorization
 * token.
 */
export async function getBudgetStates(): Promise<BudgetState[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}BudgetStates`;
    const budgetStates = await axios
        .get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<BudgetState[]>) => {
            return response.data;
        });
    return budgetStates;
}
