import apiClient, { parseAxiosError, ApiError } from '../api/apiClient';
import type { Property } from '../types/property';

export const propertyService = {

    getAll: async (): Promise<Property[]> => {
        try {
            const response = await apiClient.get<Property[]>('/Properties');
            return response.data ?? [];
        } catch (error) {
            const parsed = parseAxiosError(error);
            // Do not mask 404s for collections - let caller handle unexpected statuses
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },


    create: async (dto: unknown): Promise<string> => {
        try {
            const response = await apiClient.post('/Properties', dto);
            const data: unknown = response.data;
            if (typeof data === 'string') return data;
            if (data && typeof data === 'object' && ('id' in data)) return String(data.id);
            // Fallback - return whatever was returned as string
            return String(data ?? '');
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },


    update: async (id: string, dto: unknown): Promise<void> => {
        try {
            // Expecting 204 No Content on success
            await apiClient.put(`/Properties/${id}`, dto);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            // Expecting 204 No Content on success
            await apiClient.delete(`/Properties/${id}`);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    }
};
