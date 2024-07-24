import axios, { AxiosResponse } from "axios";
import { getSecureData } from "services/store-data/store-data";
import sessionNames from "utils/session-info";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey, wcIdKey } = sessionNames;

/**
 * The Personnel type defines properties for an personnrl/uesr's email, ID, last name, full name, name,
 * type, and work center ID.
 */
export type Personnel = {
    email: string;
    id: number;
    lastName: string;
    fullName: string;
    name: string;
    type: string;
    wcId: number;
};

/**
 * This function retrieves detailed personnel data for a specific user ID using an API
 * endpoint with authorization.
 */
export async function getUserData({
    userId,
}: {
    userId: number;
}): Promise<Personnel> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Personnels/${userId}/v2details`;
    return await axios({
        method: "get",
        url,
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    }).then((response: AxiosResponse<Personnel>) => {
        return response.data;
    });
}

/* The `interface Responsible` is extending the `Personnel` type by adding an additional property
`profileImage` of type string. 
 */
interface Responsible extends Personnel {
    profileImage: string;
}

/**
 * The function `getResponsiblesApi` retrieves active personnel data based on specific criteria from an
 * API using Axios.
 */
export async function getResponsiblesApi(): Promise<Responsible[]> {
    const url = `${API_URL}Personnels/findActive`;
    const Authorization = await getSecureData(userKey);
    const wcId = ((await getSecureData(wcIdKey)) || "").split(",");

    const params = {
        where: { wcId: { inq: wcId } },
        type: { neq: "OPERARIO" },
        order: "name asc",
    };

    return await axios
        .get(url, {
            params: { filter: JSON.stringify(params) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Responsible[]>) => {
            return response.data;
        });
}
