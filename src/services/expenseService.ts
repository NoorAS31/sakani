import apiClient from '../api/apiClient';
import { ExpenseType, type CreateExpenseDto, type Expense } from '../types/expense';

type ExpenseApiModel = Partial<Expense> & {
    ExpenseID?: string;
    PropertyId?: string;
    UnitId?: string | null;
    Amount?: number;
    Description?: string | null;
    ExpenseType?: number;
    ExpenseDate?: string;
};

const toNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeExpense = (expense: ExpenseApiModel): Expense => ({
    expenseID: expense.expenseID ?? expense.ExpenseID ?? '',
    propertyId: expense.propertyId ?? expense.PropertyId ?? '',
    unitId: expense.unitId ?? expense.UnitId ?? null,
    amount: toNumber(expense.amount ?? expense.Amount, 0),
    description: expense.description ?? expense.Description ?? null,
    expenseType: toNumber(expense.expenseType ?? expense.ExpenseType, 0),
    expenseDate: expense.expenseDate ?? expense.ExpenseDate ?? ''
});

export const expenseService = {
    getAll: async (): Promise<Expense[]> => {
        const response = await apiClient.get<ExpenseApiModel[]>('/Expenses');
        return response.data.map(normalizeExpense);
    },
    getByPropertyId: async (propertyId: string): Promise<Expense[]> => {
        const response = await apiClient.get<ExpenseApiModel[]>(`/Expenses/property/${propertyId}`);
        return response.data.map(normalizeExpense);
    },
    getByUnitId: async (unitId: string): Promise<Expense[]> => {
        const response = await apiClient.get<ExpenseApiModel[]>(`/Expenses/unit/${unitId}`);
        return response.data.map(normalizeExpense);
    },
    create: async (dto: CreateExpenseDto): Promise<string> => {
        const parsedType = Number(dto.expenseType);
        const safeExpenseType = Number.isFinite(parsedType)
            ? Math.min(5, Math.max(1, Math.trunc(parsedType)))
            : ExpenseType.Maintenance;

        const payload = {
            propertyId: dto.propertyId,
            unitId: dto.unitId ?? null,
            amount: Number(dto.amount),
            description: dto.description ?? '',
            expenseType: safeExpenseType
        };

        const response = await apiClient.post<{ Id: string } | string>('/Expenses', payload);
        if (typeof response.data === 'string') {
            return response.data;
        }

        return response.data.Id;
    },
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/Expenses/${id}`);
    },
    update: async (id: string): Promise<void> => {
        await apiClient.put(`/Expenses/${id}`)

    }
};
