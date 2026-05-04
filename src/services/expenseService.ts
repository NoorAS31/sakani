import apiClient from '../api/apiClient';
import {type CreateExpenseDto, type Expense} from '../types/expense';

export const expenseService = {
    getAll: async (): Promise<Expense[]> => {
        const response = await apiClient.get<Expense[]>('/Expenses');
        return response.data;
    },

    getByPropertyId: async (propertyId: string): Promise<Expense[]> => {
        const response = await apiClient.get<Expense[]>(`/Expenses/property/${propertyId}`);
        return response.data;
    },

    create: async (dto: any) => {
        const res = await apiClient.post('/Expenses', dto);
        return res.data;
    },
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/Expenses/${id}`);
    },

    update: async (id: string, dto: Partial<CreateExpenseDto>): Promise<void> => {
        await apiClient.put(`/Expenses/${id}`, dto);
    }
};