import { DefaultTheme } from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

interface CustomColors extends MD3Colors {
    dark: string;
    darkGrey: string;
    lightGrey: string;
    background: string;
    backgroundCard: string;
    primaryContrast: string;
    primaryLight: string;
    successLight: string;
    dangerLight: string;
    deepBlueLight: string;
    codeColor: string;
    danger: string;
    success: string;
    successIntense: string;
    dangerIntense: string;
}

declare module "react-native-paper" {
    export interface DefaultTheme extends DefaultTheme {
        colors: CustomColors;
    }
}
