import apiClient from '../api/apiClient';
import type { Property } from '../types/property';

const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const propertyService = {

    getAll: async (): Promise<Property[]> => {
        try {
            const response = await apiClient.get<Property[]>('/Properties');
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    create: async (dto: unknown): Promise<string> => {
        try {
            const response = await apiClient.post<string>('/Properties', dto);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    update: async (id: string, dto: unknown): Promise<void> => {
        try {
            await apiClient.put(`/Properties/${id}`, dto);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/Properties/${id}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
};