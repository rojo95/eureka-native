import axios, { AxiosResponse } from "axios";
import { getSecureData } from "services/store-data/store-data";
import sessionNames from "utils/session-info";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey, wcIdKey } = sessionNames;

/**
 * The type `Client` defines properties for a client including business name, CIF/NIF, email, ID, name,
 * person type, profile image, and telephone.
 */
export type Client = {
    businessName?: string | null;
    cifNif: string;
    email?: string | null;
    id: number;
    name: string;
    personType: string;
    profileImage?: string | null;
    telephone?: string | null;
};

/**
 * The function `getClients` retrieves client data from an API based on specified parameters and
 * returns a Promise containing the client information.
 */
export async function getClients(): Promise<Client[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Clients`;
    const wcId = ((await getSecureData(wcIdKey)) || "").split(",");

    const params = {
        fields: [
            "id",
            "name",
            "businessName",
            "wcId",
            "personType",
            "defaultVatId",
            "salesLedgerAccountNumber",
        ],
        where: {
            wcId: { inq: wcId },
            or: [{ name: { neq: null } }, { businessName: { neq: null } }],
            personType: { inq: ["lead", "client"] },
        },
        order: "name Asc",
        limit: 100,
    };

    return await axios
        .get(url, {
            params: { filter: JSON.stringify(params) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Client[]>) => {
            return response.data;
        });
}
