import apiClient, { parseAxiosError, ApiError } from '../api/apiClient';
import type { AxiosRequestConfig } from 'axios';
import type { Contract, CreateContractDto, ContractDetails, MyContractDetailsDto } from '../types/contract';

export const contractService = {
    getAll: async (): Promise<Contract[]> => {
        try {
            const response = await apiClient.get<Contract[]>('/Contract');
            return response.data ?? [];
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },
    getById: async (id: string): Promise<ContractDetails> => {
        try {
            const response = await apiClient.get<ContractDetails>(`/Contract/${id}`);
            return response.data;
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    create: async (dto: CreateContractDto): Promise<string> => {
        try {
            const response = await apiClient.post('/Contract', dto);
            const data: unknown = response.data;
            if (typeof data === 'string') return data;
            if (data && typeof data === 'object' && ('id' in data)) return String(data.id);
            return String(data ?? '');
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    terminate: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/Contract/${id}`);
        } catch (error) {
            const parsed = parseAxiosError(error);
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    },

    getMyActiveContract: async (config?: AxiosRequestConfig): Promise<MyContractDetailsDto | null> => {
        try {
            const response = await apiClient.get<MyContractDetailsDto>('/Contract/my-active', config);
            if (response.status === 204) return null;
            return response.data ?? null;
        } catch (error) {
            const parsed = parseAxiosError(error);
            // If the API returns 204 No Content it will not throw; other errors are rethrown
            throw new ApiError(parsed.message, parsed.status, parsed.validation);
        }
    }
};
