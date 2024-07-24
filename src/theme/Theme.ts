import { Platform } from "react-native";
import {
    MD3LightTheme as DefaultTheme,
    configureFonts,
} from "react-native-paper";

const fontConfig: any = {
    customVariant: {
        fontFamily: Platform.select({
            web: "Manrope",
            ios: "System",
            default: "Manrope",
        }),
        fontWeight: "400",
        letterSpacing: 0.5,
        lineHeight: 22,
        fontSize: 20,
    },
};

// custom Theme
const Theme = {
    ...DefaultTheme,
    fonts: configureFonts({ config: fontConfig }),
    // Specify custom property
    myOwnProperty: true,
    // Specify custom property in nested object
    colors: {
        ...DefaultTheme.colors,
        primary: "#F39200",
        dark: "#121d29",
        darkGrey: "#3C414F",
        background: "#FFF",
        backgroundCard: "#FFF",
        primaryContrast: "#FFF",
        primaryLight: "#FFE0B2",
        successLight: "#DCEDC8",
        dangerLight: "#EF9A9A",
        deepBlueLight: "#A8B6FF",
        codeColor: "#4F7396",
        danger: "#AC3500",
        success: "#59ACA3",
        lightGrey: "#D0D0D0",
        successIntense: "#44cf73",
        dangerIntense: "#ee5a3f",
    },
};

export default Theme;
