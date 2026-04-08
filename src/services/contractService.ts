import apiClient from '../api/apiClient';
import type { Contract, CreateContractDto, ContractDetails } from '../types/contract';

export const contractService = {
    getAll: async (): Promise<Contract[]> => {
        const response = await apiClient.get<Contract[]>('/Contract');
        return response.data;
    },
    getById: async (id: string): Promise<ContractDetails> => {
        const response = await apiClient.get<ContractDetails>(`/Contract/${id}`);
        return response.data;
    },
    create: async (dto: CreateContractDto): Promise<string> => {
        const response = await apiClient.post<string>('/Contract', dto);
        return response.data;
    },
    terminate: async (id: string): Promise<void> => {
        await apiClient.delete(`/Contract/${id}`);
    }
};