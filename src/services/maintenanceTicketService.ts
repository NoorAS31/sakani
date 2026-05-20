import apiClient from '../api/apiClient';
import type { MaintenanceTicket, CreateMaintenanceTicketDto, UpdateMaintenanceTicketDto, UpdateMaintenanceTicketStatusDto } from '../types/maintenanceTicket';

interface GetMaintenanceTicketsParams {
    status?: number;
    unitId?: string;
    renterId?: string;
    searchTerm?: string;
    fromDate?: string;
    toDate?: string;
}

const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const maintenanceTicketService = {
    // Create a new maintenance ticket
    create: async (dto: CreateMaintenanceTicketDto): Promise<string> => {
        try {
            const response = await apiClient.post<string>('/maintenance-tickets', dto);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get all maintenance tickets with filters
    getAll: async (params?: GetMaintenanceTicketsParams): Promise<MaintenanceTicket[]> => {
        try {
            const response = await apiClient.get<MaintenanceTicket[]>('/maintenance-tickets', { params });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get current user's maintenance tickets
    getMy: async (): Promise<MaintenanceTicket[]> => {
        try {
            const response = await apiClient.get<MaintenanceTicket[]>('/maintenance-tickets/my');
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get a single maintenance ticket by ID
    getById: async (id: string): Promise<MaintenanceTicket> => {
        try {
            const response = await apiClient.get<MaintenanceTicket>(`/maintenance-tickets/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Get a single renter maintenance ticket by ID
    getRenterTicketById: async (id: string): Promise<MaintenanceTicket> => {
        try {
            const response = await apiClient.get<MaintenanceTicket>(`/maintenance-tickets/renter/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Update a maintenance ticket
    update: async (id: string, dto: UpdateMaintenanceTicketDto): Promise<void> => {
        try {
            await apiClient.put(`/maintenance-tickets/${id}`, dto);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Cancel a maintenance ticket
    cancel: async (id: string): Promise<void> => {
        try {
            await apiClient.put(`/maintenance-tickets/${id}/cancel`);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Update maintenance ticket status
    updateStatus: async (dto: UpdateMaintenanceTicketStatusDto): Promise<void> => {
        try {
            await apiClient.patch('/maintenance-tickets/status', dto);
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    // Upload image to a maintenance ticket
    uploadImage: async (ticketId: string, imageFile: File): Promise<void> => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            await apiClient.post(`/maintenance-tickets/${ticketId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
};
