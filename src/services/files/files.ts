import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { StorageAccessFramework } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

const AppDocsDir = FileSystem.cacheDirectory + "Eureka/";

export const fileRoute = (name: string) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const CONTAINER = process.env.EXPO_PUBLIC_CONTAINER;
    return `${API_URL}containers/${CONTAINER}/download/${name}`;
};

/**
 * function to generate the local file uri
 */
const generateFileUri = (fileName: string) => AppDocsDir + `${fileName}`;

/**
 * Function to generate the correct mime type by file
 */
export const getMimeType = (fileName: string) => {
    const extension = fileName.split(".").pop();
    switch (extension) {
        case "pdf":
            return "application/pdf";
        case "doc":
            return "application/msword";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "xls":
            return "application/vnd.ms-excel";
        default:
            return "application/octet-stream";
    }
};

/**
 * function to show the allowed file types
 */
export function restrictFileTypes({ name }: { name: string }): boolean {
    const type = getMimeType(name);

    return type !== "application/octet-stream";
}

/**
 * Checks if directory exists. If not, creates it
 */
async function ensureDirExists() {
    const dirInfo = await FileSystem.getInfoAsync(AppDocsDir);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AppDocsDir, {
            intermediates: true,
        });
    }
}

/**
 * Function to download the remote filess
 */
export async function downLoadRemoteFile({
    fileName,
    url,
}: {
    fileName: string;
    url: URL;
}): Promise<boolean> {
    const { OS } = Platform;

    const options = {
        headers: {
            "Cache-Control": "no-store",
        },
        resume: true,
    };

    if (OS !== "web") {
        try {
            await ensureDirExists();

            const fileUri = generateFileUri(fileName);

            const permissions =
                await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                throw new Error(
                    "No permissions granted to access external storage"
                );
            }

            // the file is stored temporarily
            const tempDownloadRes = await FileSystem.downloadAsync(
                url.toString(),
                fileUri,
                options
            );

            const { status } = tempDownloadRes;
            if (status === 400) {
                throw new Error("Error 400 Bad Request");
            } else if (status === 403) {
                throw new Error("Error 403 Access Denied");
            } else if (status !== 200) {
                throw new Error(`Error ${status}`);
            }

            // copy file to an accessible directory
            const docsDirectory = permissions.directoryUri;
            fileName = fileName.split("/").pop()!;

            // Get file content
            const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Create new file and write content
            const destinationFileUri =
                await StorageAccessFramework.createFileAsync(
                    docsDirectory,
                    fileName,
                    getMimeType(fileName)
                );
            await FileSystem.writeAsStringAsync(
                destinationFileUri,
                fileContent,
                {
                    encoding: FileSystem.EncodingType.Base64,
                }
            ).catch((e) => {
                throw e;
            });

            // Delete temporary file
            await FileSystem.deleteAsync(fileUri).catch((e) => {
                throw e;
            });

            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    } else {
        // TODO: should make the functionality to donwload the file at the pc
        return true;
    }
}

/**
 * function to pick the documents
 */
export async function pickDocument() {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*", // Allow to select any kind of file
            copyToCacheDirectory: true,
        });

        if (result && !result.canceled && result.assets[0].name) {
            return result.assets[0];
        }
    } catch (err: any) {
        throw err.response || err.request || err;
    }
}
