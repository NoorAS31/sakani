import apiClient from '../api/apiClient';
import type { Unit } from '../types/unit';

const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const unitService = {
    getAll: async (): Promise<Unit[]> => {
        try {
            const response = await apiClient.get<Unit[]>('/units');
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    getByPropertyId: async (propertyId: string): Promise<Unit[]> => {
        // eslint-disable-next-line no-useless-catch
        try {
            const response = await apiClient.get<Unit[]>(`/units/property/${propertyId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    create: async (dto: unknown): Promise<string> => {
        try {
            const response = await apiClient.post<string>('/units', dto);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    update: async (id: string, dto: unknown): Promise<void> => {
        try {
            await apiClient.put(`/Units/${id}`, dto);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/units/${id}`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
};