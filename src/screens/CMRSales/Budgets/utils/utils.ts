import { DefaultTheme } from "react-native-paper";

/**
 * function to return the budget state color
 */
export function getColorState({
    statusId,
    theme,
}: {
    statusId: number;
    theme: DefaultTheme;
}) {
    switch (statusId) {
        case 1:
            return theme.colors.primaryLight;
        case 2:
            return theme.colors.deepBlueLight;
        case 4:
            return theme.colors.dangerLight;
        default:
            return theme.colors.successLight;
    }
}

/**
 * Function to calculate K total
 */
export const calculateKTotal = ({
    totalCost,
    totalSale,
}: {
    totalCost: number;
    totalSale: number;
}) => {
    return totalSale / totalCost;
};

/**
 * Function to calculate the Margin Profit
 */
export const calculateMarginProfit = ({
    totalCost,
    totalSale,
}: {
    totalCost: number;
    totalSale: number;
}) => {
    const kTotal = calculateKTotal({ totalCost, totalSale });
    if (!kTotal) return 0;
    return (1 - 1 / kTotal) * 100;
};
