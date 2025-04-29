export type Budget = {
    category: string;
    budgeted: number;
    amountSpent: number;
};

export type Suggestion = {
    id: number;
    text: string;
    category: string;
    currentBudget: number;
    suggestedBudget: number;
};

export type Asset = {
    type: string;
    name: string;
    balance: number;
};

export type Transaction = {
    id: number;
    date: string;
    tag: string;
    name: string;
    amount: number;
    dateObj: Date;
    month: number;
    year: number;
};