export const ExpenseType = {
    Maintenance: 1,
    Utility: 2,
    Tax: 3,
    Insurance: 4,
    Other: 5
} as const;

export type expenseType = (typeof ExpenseType)[keyof typeof ExpenseType];

export interface Expense {
    expenseID: string;
    propertyId: string;
    unitId: string | null;
    amount: number;
    description: string | null;
    expenseType: expenseType | number;
    expenseDate: string;
}

export interface CreateExpenseDto {
    propertyId: string;
    unitId?: string | null;
    amount: number;
    description?: string;
    expenseType: expenseType | number;
}
