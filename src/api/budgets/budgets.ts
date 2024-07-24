import axios, { AxiosResponse } from "axios";
import { getSecureData } from "services/store-data/store-data";
import sessionNames from "utils/session-info";
import { Activity } from "../activities/activities";
import { Client } from "../clients/clients";
import { Personnel } from "../personnels/personnels";
import { BudgetState } from "../budget-states/budget-states";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { userKey, wcIdKey } = sessionNames;

/**
 * The type `Tracking` defines properties related to tracking tasks or activities.
 */
export type Tracking = {
    author: string;
    createdAt: Date;
    createdBy: string;
    date: Date;
    done: boolean;
    doneDate?: Date | null;
    id: number;
    notes: string;
    personnel: Personnel;
    type: number;
    updatedAt: Date;
};

/**
 * The type `Place` defines a structure with properties for id, latitude, longitude, and name.
 */
type Place = {
    id: number;
    lat: number;
    lng: number;
    name: string;
};

/**
 * The above code is defining an interface named `Responsible` that extends another interface named
 * `Personnel`. This means that the `Responsible` interface will inherit all properties and methods
 * from the `Personnel` type.
 */
interface Responsible extends Personnel {}

/**
 * The type `Budget` represents a budget object with various properties related to activities, clients,
 * responsible parties, state, title, costs, chapters, place, and hours.
 */
export type Budget = {
    activity: Activity;
    client: Client;
    createdAt: Date;
    id: number;
    number: string;
    responsible: Responsible;
    state: BudgetState;
    title: string;
    totalCost: number;
    totalSale: number;
    chapters: Chapter[];
    place: Place;
    totalHours: string;
};

/**
 * The type `Batch` defines a structure with various properties for representing batches of items.
 */
export interface Batch extends BatchBase {
    totalSale: number;
    subBatches: SubBatch[];
    chapterId: number;
    coefficient: number;
    saleDiscount: number;
    saleUd: number;
    saleUdWithoutDiscount: number;
    forceSaleUd: boolean;
}

export type BatchBase = {
    id: number;
    code?: string | null;
    rank: number;
    units: string;
    description: string;
    subText?: string | null;
    amount: number;
    moCost: number;
    matCost: number;
    costUd: number;
    totalCost: number;
    imageUrl?: string | null;
    retailPrice: number;
    purchaseDiscounts: number[];
    outsourceCost: number;
    providerId: number;
};

export interface SubBatch extends BatchBase {
    batchId: number;
}

/**
 * The type `Chapter` represents a chapter with various properties related to its description, rank,
 * costs, sales, and batches.
 */
export type Chapter = {
    id: number;
    description: string;
    rank: number;
    kMat: number;
    kMo: number;
    kOut: number;
    totalCost: number;
    totalSale: number;
    batches: Batch[];
    subChapters?: Chapter[];
};

/**
 * The type `Attachment` defines properties related to attachments in a budget, including IDs, dates,
 * descriptions, and URLs.
 */
export type Attachment = {
    budgetId: number;
    clientInvoiceId?: number | null;
    createdAt: Date;
    createdBy: number;
    description?: string | null;
    extraPersonnelId?: number | null;
    id: number;
    incomingId?: number | null;
    modifiedAt: Date;
    modifiedBy: number;
    name: string;
    orderId?: number | null;
    orderReturnId?: number | null;
    providerInvoiceId?: number | null;
    url: URL;
    workId?: number | null;
    workOrderId?: number | null;
};

/**
 * The function `getBudgets` retrieves budget information based on specified criteria and returns the
 * budgets along with the total count.
 */
export async function getBudgets({
    page,
    limit,
    fields,
    textFilter,
    client,
    states,
    responsibles,
    activities,
    createdFrom,
    createdTo,
}: {
    page: number;
    limit: number;
    fields?: string[];
    textFilter?: string;
    client?: number;
    states?: number[];
    responsibles?: number[];
    activities?: number[];
    createdFrom?: Date;
    createdTo?: Date;
}): Promise<{ budgets: Budget[]; total: number }> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Budgets/list`;
    const fieldsDefault: string[] = [
        "id",
        "number",
        "title",
        "clientId",
        "stateId",
        "totalCost",
        "totalSale",
        "createdAt",
        "updatedAt",
        "wcId",
        "personnelResponsibleId",
        "activityId",
        "discount",
        "isActivityByAdministration",
    ];
    const wcId = ((await getSecureData(wcIdKey)) || "")
        .split(",")
        .map((v) => parseInt(v));

    const params = {
        where: {
            wcId: { inq: wcId },
            isActivityByAdministration: false,
            ...(responsibles && { responsibles: responsibles }),
            ...(activities && { activities: activities }),
            ...(client && { clients: client }),
            ...(states && { states: states }),
            ...(createdFrom && { createdFrom: createdFrom }),
            ...(createdTo && { createdTo: createdTo }),
            ...(textFilter && {
                and: [
                    {
                        or: [
                            { title: { like: `%${textFilter}%` } },
                            { number: { like: `%${textFilter}%` } },
                        ],
                    },
                ],
            }),
        },
        // TODO: should make dynamic the fields
        fields: fields || fieldsDefault,
        limit: limit,
        offset: (page - 1) * limit,
        include: ["client", "state", "workCenter", "responsible", "activity"],
        order: "title ASC",
    };

    const budgets = await axios
        .get(url, {
            params: { filter: JSON.stringify(params) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Budget[]>) => {
            return response.data;
        });

    const total = await axios
        .get(`${API_URL}Budgets/listCount`, {
            params: { where: JSON.stringify(params.where) },
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<{ count: number }>) => {
            return response.data;
        });

    return { budgets, total: total.count };
}

/**
 * This function retrieves budget information by making a secure API call with the provided
 * budget ID.
 */
export async function getBudget({
    budgetId,
}: {
    budgetId: number;
}): Promise<Budget> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Budgets/getCompleteById?id=${budgetId}`;

    const budget = await axios
        .get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Budget>) => {
            return response.data;
        });

    return budget;
}

/**
 * This function retrieves budget tracking data by making a GET request to a specific API
 * endpoint.
 */
export async function getBudgetTracking({
    budgetId,
}: {
    budgetId: number;
}): Promise<Tracking[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Tracking/getTracking?model=Budget&modelId=${budgetId}`;
    const tracking = await axios
        .get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Tracking[]>) => {
            return response.data;
        });

    return tracking;
}

/**
 * This function retrieves budget attachments by making a GET request to a specific API
 * endpoint with the provided budgetId.
 */
export async function getBudgetAttachments({
    budgetId,
}: {
    budgetId: number;
}): Promise<Attachment[]> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}AttachedFiles?`;
    const params = { filter: { where: { budgetId } } };

    const attachments = await axios
        .get(url, {
            params,
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<Attachment[]>) => {
            return response.data;
        });

    return attachments;
}

export type CreateChapter = Pick<
    Chapter,
    "rank" | "kMat" | "kMo" | "kOut" | "description"
>;

/**
 * function to create a new chapter into the budget
 * sending the chapter data and the budghet ID
 */
export async function createChapter({
    budgetId,
    chapter: { rank, kMat, kMo, kOut, description },
}: {
    budgetId: number;
    chapter: CreateChapter;
}): Promise<Chapter> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Budgets/${budgetId}/createChapter`;

    const params = {
        id: budgetId,
        chapter: {
            rank,
            kMat,
            kMo,
            kOut,
            description,
            batches: [],
            activeRow: true,
        },
    };

    const options = {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    };

    const createdChapter = await axios
        .post(url, params, options)
        .then((response: AxiosResponse<Chapter>) => {
            return response.data;
        });

    return createdChapter;
}

/**
 * function to update the budget chapters data
 */
export async function updateBudget({
    budgetId,
    budget,
}: {
    budgetId: number;
    budget: Budget;
}) {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Budgets/${budgetId}/updateBudget`;

    const options = {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    };

    const params = {
        id: budgetId,
        budget,
    };

    const updatedBudget = await axios
        .post(url, params, options)
        .then((response: AxiosResponse<Budget>) => {
            return response.data;
        });

    return updatedBudget;
}

/**
 * function to delete one chapter by chapter ID
 */
export async function deleteChapter({ chapterId }: { chapterId: number }) {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Chapters/deleteAllChapter?chapterId=${chapterId}`;

    await axios.delete(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    });
}

type CreateBatchBase = Omit<
    Batch,
    | "id"
    | "costUd"
    | "subBatches"
    | "chapterId"
    | "matCost"
    | "moCost"
    | "outsourceCost"
    | "totalCost"
    | "retailPrice"
    | "purchaseDiscounts"
>;

export type CreateBatch = CreateBatchBase &
    Partial<
        Pick<
            Batch,
            | "matCost"
            | "moCost"
            | "outsourceCost"
            | "totalCost"
            | "retailPrice"
            | "purchaseDiscounts"
        >
    >;

export async function createBatch({
    budgetId,
    chapter,
    batch,
}: {
    budgetId: number;
    chapter: Chapter;
    batch: CreateBatch;
}): Promise<Batch> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Budgets/${budgetId}/createBatch`;

    const params = {
        id: budgetId,
        chapter,
        batch,
    };

    const options = {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    };

    const createdBatch: Batch = await axios
        .post(url, params, options)
        .then((response: AxiosResponse<Batch>) => {
            return response.data;
        });

    return createdBatch;
}

/**
 * function to delete one batch by batch ID
 */
export async function deleteBatch({ batchId }: { batchId: number }) {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Batches/deleteAllBatch?batchId=${batchId}`;

    await axios.delete(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    });
}

export type CreateSubBatch = Omit<SubBatch, "id" | "costUd" | "batchId">;

export async function createSubBatch({
    budgetId,
    subBatch,
    batch,
}: {
    budgetId: number;
    subBatch: CreateSubBatch;
    batch: Batch;
}) {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}Budgets/${budgetId}/createSubBatch`;

    const params = {
        id: budgetId,
        subBatch,
        batch,
    };

    const options = {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    };

    const createdSubBatch = await axios
        .post(url, params, options)
        .then((response: AxiosResponse<SubBatch>) => {
            return response.data;
        });
    return createdSubBatch;
}

/**
 * function to delete one sub batch by sub batch ID
 */
export async function deleteSubBatch({ subBatchId }: { subBatchId: number }) {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}SubBatches/deleteAllSubBatch?subBatchId=${subBatchId}`;

    await axios.delete(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization,
        },
    });
}
