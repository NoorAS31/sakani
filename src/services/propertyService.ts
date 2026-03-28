import apiClient from '../api/apiClient';
import type { Property } from '../types/property';

export const propertyService = {

    getAll: async (): Promise<Property[]> => {
        const response = await apiClient.get<Property[]>('/Properties');
        return response.data;
    },

    // POST api/Properties
    create: async (dto: any): Promise<string> => {
        const response = await apiClient.post<string>('/Properties', dto);
        return response.data;
    },

    // PUT api/Properties/{id}
    update: async (id: string, dto: any): Promise<void> => {
        await apiClient.put(`/Properties/${id}`, dto);
    },

    // DELETE api/Properties/{id}
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/Properties/${id}`);
    }
};