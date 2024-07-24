import axios, { AxiosResponse } from "axios";
import {
    getMimeType,
    pickDocument,
    restrictFileTypes,
} from "services/files/files";
import { getSecureData } from "services/store-data/store-data";
import sessionNames from "utils/session-info";
import { Attachment } from "../budgets/budgets";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CONTAINER = process.env.EXPO_PUBLIC_CONTAINER;
const { userKey } = sessionNames;

/**
 * This function deletes a budget attachment by sending a DELETE request to a specified API
 * endpoint with the attachment ID and user authorization.
 */
type deleteResponse = {
    count: number;
};
export async function deleteBudgetAttachment({
    id,
}: {
    id: number;
}): Promise<deleteResponse> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}AttachedFiles/${id}`;

    const deletedBudgetAttachment = await axios
        .delete(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization,
            },
        })
        .then((response: AxiosResponse<deleteResponse>) => {
            return response.data;
        });

    return deletedBudgetAttachment;
}

/**
 * The function `uploadBudgetAttachment` uploads a budget attachment to an API after picking a document
 * and performing necessary validations.
 */
export async function uploadBudgetAttachment({
    idBudget,
}: {
    idBudget: number;
}): Promise<Attachment> {
    const Authorization = await getSecureData(userKey);
    const url = `${API_URL}AttachedFiles`;

    const document = await pickDocument();
    if (document) {
        const { uri, name, mimeType } = document!;

        if (!restrictFileTypes({ name: name })) throw { error: true };
        const {
            result: {
                files: { file },
            },
        } = await uploadFile({
            uri,
            name,
            mimeType: mimeType || getMimeType(name),
        });

        const {
            name: fileName,
            type: fileType,
            providerResponse: { location: urlFile },
        } = file[0];

        const attachment = await axios
            .put(
                url,
                {
                    name: fileName,
                    type: fileType,
                    budgetId: idBudget,
                    url: urlFile,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization,
                    },
                }
            )
            .then((response: AxiosResponse<Attachment>) => {
                return response.data;
            });

        return attachment;
    } else throw new Error("Error picking document");
}

/**
 * The type `FileResponse` represents a response object containing file information with a specific
 * provider response location.
 */
export type FileResponse = {
    result: {
        files: {
            file: [
                {
                    name: string;
                    type: string;
                    providerResponse: {
                        location: string;
                    };
                },
            ];
        };
    };
};

/**
 * The function `uploadFile` asynchronously uploads a file to an API endpoint using FormData.
 */
export async function uploadFile({
    uri,
    name,
    mimeType,
}: {
    uri: string;
    name: string;
    mimeType: string;
}): Promise<FileResponse> {
    const url = `${API_URL}containers/${CONTAINER}/upload`;

    const formData: any = new FormData();

    formData.append("file", {
        uri,
        name,
        type: mimeType,
    });

    const headers = {
        "Content-Type": "multipart/form-data",
    };

    const resp = await fetch(url, {
        method: "post",
        body: formData,
        headers,
    })
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            throw err;
        });

    return resp;
}
