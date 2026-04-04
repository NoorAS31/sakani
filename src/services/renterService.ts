import apiClient from '../api/apiClient';
import type { Renter, CreateRenterDto } from '../types/renter';

export const renterService = {
    getAll: async (): Promise<Renter[]> => {
        const response = await apiClient.get<Renter[]>('/Renters');
        return response.data;
    },

    getById: async (id: string): Promise<Renter> => {
        const response = await apiClient.get<Renter>(`/Renters/${id}`);
        return response.data;
    },

    create: async (dto: CreateRenterDto): Promise<string> => {
        const response = await apiClient.post<string>('/Renters', dto);
        return response.data;
    }
};