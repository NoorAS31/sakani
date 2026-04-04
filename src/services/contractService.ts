import apiClient from '../api/apiClient';
import type { Contract, CreateContractDto } from '../types/contract';

export const contractService = {
    getAll: async (): Promise<Contract[]> => {
        const response = await apiClient.get<Contract[]>('/Contract');
        return response.data;
    },
    create: async (dto: CreateContractDto): Promise<string> => {
        const response = await apiClient.post<string>('/Contract', dto);
        return response.data;
    }
};