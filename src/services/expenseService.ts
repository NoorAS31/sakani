import apiClient, { parseAxiosError, ApiError } from '../api/apiClient';
import type { Expense } from '../types/expense';

export const expenseService = {
    getAll: async (): Promise<Expense[]> => {
        try {
            const response = await apiClient.get<Expense[]>('/Expenses');
            return response.data ?? [];
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    getByPropertyId: async (propertyId: string): Promise<Expense[]> => {
        try {
            const response = await apiClient.get<Expense[]>(`/Expenses/property/${propertyId}`);
            return response.data ?? [];
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    create: async (dto: unknown): Promise<string> => {
        try {
            const res = await apiClient.post('/Expenses', dto);
            const data: unknown = res.data;
            if (typeof data === 'string') return data;
            if (data && typeof data === 'object' && ('id' in data)) return String(data.id);
            return String(data ?? '');
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/Expenses/${id}`);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    update: async (id: string, dto: { expenseId: string; amount: number; description: string; expenseType: number }): Promise<void> => {
        try {
            await apiClient.put(`/Expenses/${id}`, dto);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    }
};