export const FORM_TYPES = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
} as const;

export const BUDGET_STATES = {
    PROGRESS: 1,
    PENDING: 2,
    CONTRACTED: 3,
    UNCONTRACTED: 4,
} as const;

export const ITEM_TYPES = {
    CHAPTER: 1,
    BATCH: 2,
    SUBBATCH: 3,
} as const;
