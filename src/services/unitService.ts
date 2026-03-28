import apiClient from '../api/apiClient';
import type { Unit } from '../types/unit';

export const unitService = {
    getAll: async (): Promise<Unit[]> => {
        const response = await apiClient.get<Unit[]>('/units');
        return response.data;
    },

    getByPropertyId: async (propertyId: string): Promise<Unit[]> => {
        const response = await apiClient.get<Unit[]>(`/units/property/${propertyId}`);
        return response.data;
    },


    create: async (dto: any): Promise<string> => {
        const response = await apiClient.post<string>('/units', dto);
        return response.data;
    },

    // PUT api/Properties/{id}
    update: async (id: string, dto: any): Promise<void> => {
        await apiClient.put(`/Units/${id}`, dto);
    },

    // DELETE api/Properties/{id}
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/units/${id}`);
    }
};