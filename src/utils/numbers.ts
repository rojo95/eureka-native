import { Language } from "contexts/UserContext";
import { getLocale } from "./functions";

/**
 * function to give format to date fields
 */
export function setDateFormat({
    date,
    language,
}: {
    date: Date;
    language: Language;
}): string {
    const locale = getLocale({ locale: language });
    const newDate = new Intl.DateTimeFormat(locale)?.format(date);
    return newDate;
}

/**
 * function to give format to prices
 */
export function formatPrices({
    number,
    language,
}: {
    number: number;
    language: Language;
}): string {
    const locale = getLocale({ locale: language });
    return parseFloat(number?.toFixed(2)).toLocaleString(locale);
}
