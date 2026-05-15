import apiClient from '../api/apiClient';
import type { Expense } from '../types/expense';

const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const expenseService = {
    getAll: async (): Promise<Expense[]> => {
        try {
            const response = await apiClient.get<Expense[]>('/Expenses');
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    getByPropertyId: async (propertyId: string): Promise<Expense[]> => {
        try {
            const response = await apiClient.get<Expense[]>(`/Expenses/property/${propertyId}`);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    create: async (dto: unknown) => {
        try {
            const res = await apiClient.post('/Expenses', dto);
            return res.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/Expenses/${id}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    update: async (id: string, dto: { expenseId: string; amount: number; description: string; expenseType: number }): Promise<void> => {
        try {
            await apiClient.put(`/Expenses/${id}`, dto);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
};