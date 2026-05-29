import apiClient from '../api/apiClient';
import type { AxiosRequestConfig } from 'axios';
import type {
    MaintenanceTicket,
    CreateMaintenanceTicketDto,
    UpdateMaintenanceTicketDto,
    UpdateMaintenanceTicketStatusDto
} from '../types/maintenanceTicket';

export interface GetMaintenanceTicketsParams {
    status?: number;
    unitId?: string;
    renterId?: string;
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
}

export const MaintenanceTicketService = {
    // 1. Cleaner, shorter method names
    getAll: async (params?: GetMaintenanceTicketsParams, config?: AxiosRequestConfig): Promise<MaintenanceTicket[]> => {
        const response = await apiClient.get<MaintenanceTicket[]>('/maintenance-tickets', {
            ...config,
            params: { ...params, ...config?.params }
        });
        return response.data;
    },

    getMy: async (config?: AxiosRequestConfig): Promise<MaintenanceTicket[]> => {
        const response = await apiClient.get<MaintenanceTicket[]>('/maintenance-tickets/my', config);
        return response.data;
    },

    getById: async (id: string, config?: AxiosRequestConfig): Promise<MaintenanceTicket> => {
        const response = await apiClient.get<MaintenanceTicket>(`/maintenance-tickets/${id}`, config);
        return response.data;
    },

    getRenterById: async (id: string, config?: AxiosRequestConfig): Promise<MaintenanceTicket> => {
        const response = await apiClient.get<MaintenanceTicket>(`/maintenance-tickets/renter/${id}`, config);
        return response.data;
    },

    create: async (dto: CreateMaintenanceTicketDto, config?: AxiosRequestConfig): Promise<string> => {
        // Assuming backend returns the newly created item ID or string token
        const response = await apiClient.post<string>('/maintenance-tickets', dto, config);
        return response.data;
    },

    update: async (id: string, dto: UpdateMaintenanceTicketDto, config?: AxiosRequestConfig): Promise<void> => {
        await apiClient.put(`/maintenance-tickets/${id}`, dto, config);
    },

    updateStatus: async (dto: UpdateMaintenanceTicketStatusDto, config?: AxiosRequestConfig): Promise<void> => {
        await apiClient.patch('/maintenance-tickets/status', dto, config);
    },

    cancel: async (id: string, config?: AxiosRequestConfig): Promise<void> => {
        await apiClient.put(`/maintenance-tickets/${id}/cancel`, {}, config);
    },

    uploadImage: async (ticketId: string, imageFile: File, config?: AxiosRequestConfig): Promise<{ url: string }> => {
        const formData = new FormData();
        // Match the key name your backend expects
        formData.append('file', imageFile);

        const response = await apiClient.post<{ url: string }>(
            `/maintenance-tickets/${ticketId}/images`,
            formData,
            {
                ...config,
                timeout: 30000, // 30 second timeout
                headers: {
                    ...config?.headers,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }
};