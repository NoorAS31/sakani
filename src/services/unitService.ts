import apiClient, { parseAxiosError, ApiError } from '../api/apiClient';
import type { Unit } from '../types/unit';

export const unitService = {
    getAll: async (): Promise<Unit[]> => {
        try {
            const response = await apiClient.get<Unit[]>('/units');
            return response.data ?? [];
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    getByPropertyId: async (propertyId: string): Promise<Unit[]> => {
        try {
            const response = await apiClient.get<Unit[]>(`/units/property/${propertyId}`);
            return response.data ?? [];
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },


    create: async (dto: unknown): Promise<string> => {
        try {
            const response = await apiClient.post('/units', dto);
            const data: unknown = response.data;
            if (typeof data === 'string') return data;
            if (data && typeof data === 'object' && ('id' in data)) return String(data.id);
            return String(data ?? '');
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    update: async (id: string, dto: unknown): Promise<void> => {
        try {
            await apiClient.put(`/Units/${id}`, dto);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/units/${id}`);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    }
};
