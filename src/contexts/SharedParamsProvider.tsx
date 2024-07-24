import React, {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useState,
} from "react";
import { Budget, Chapter } from "api/budgets/budgets";
import { BudgetState } from "api/budget-states/budget-states";

type Context = {
    budgetId?: number;
    chapters?: Chapter[];
    currentBudget?: Budget;
    budgetState?: BudgetState;
};

type ParamsContext = {
    contextParams: Context;
    setContextParams: Dispatch<SetStateAction<Context>>;
};

// Create context
export const ParamsContext = createContext<ParamsContext | undefined>(
    undefined
);

// Create a context provider
export const SharedParamsProvider = ({ children }: { children: ReactNode }) => {
    const [contextParams, setContextParams] = useState<Context>({});

    return (
        <ParamsContext.Provider value={{ contextParams, setContextParams }}>
            {children}
        </ParamsContext.Provider>
    );
};
