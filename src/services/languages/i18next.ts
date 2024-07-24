import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "locales/en.json";
import es from "locales/es.json";
import { Resources } from "i18next-resources-for-ts";

/**
 * languages allowed
 */
export const languageResources: Resources = {
    en: { translation: en },
    es: { translation: es },
};

/**
 * configuration
 */
i18next.use(initReactI18next).init({
    compatibilityJSON: "v3",
    lng: "es",
    fallbackLng: "es",
    resources: languageResources,
});

export default i18next;
