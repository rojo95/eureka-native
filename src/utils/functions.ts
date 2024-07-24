import { Alert } from "react-native";
import { Language } from "contexts/UserContext";

/**
 * Function to create an URL with params
 */
export function createUrl({
    urlBase,
    params,
}: {
    urlBase: URL;
    params: object;
}) {
    // create a new URLSearchParams object
    const searchParams = new URLSearchParams();

    // Add parameters to the URLSearchParams object
    for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value!);
    }

    // merge and return the URLSearchParams object to the URL
    return `${urlBase}?${searchParams.toString()}`;
}

export const getLocale = ({ locale }: { locale: Language }) =>
    locale === "es" ? "es-ES" : "en-US";

/**
 * function to detect whether the function provided is synchronous or asynchronous
 */
export const isPromise = (val: any): val is Promise<any> => {
    return val instanceof Promise || (val && typeof val.then === "function");
};

export const confirmAlert = ({
    title,
    msg = "",
    acceptText = "",
    cancelText = "",
    onCancel,
    onAccept,
}: {
    title: string;
    msg?: string;
    acceptText: string;
    cancelText: string;
    onCancel?: () => void;
    onAccept: () => void;
}) =>
    Alert.alert(title, msg, [
        {
            text: cancelText,
            onPress: () => {
                onCancel ? onCancel() : {};
            },
            style: "cancel",
        },
        {
            text: acceptText,
            onPress: () => onAccept(),
        },
    ]);

export const generateUniqueFileName = (text: string) => {
    const val = text.toLowerCase().replace(/[\W]/g, "-") + "-" + Date.now();
    return val;
};
