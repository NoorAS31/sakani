import apiClient from '../api/apiClient';
import type { AxiosRequestConfig } from 'axios';
import type { TicketResponseDto, CreateTicketDto, UpdateTicketDto, CreateTicketResponseDto } from '../types/maintenance';

export const maintenanceService = {
    // 1. جلب التذاكر الخاصة بالمستأجر الحالي
    getMyTickets: async (config?: AxiosRequestConfig): Promise<TicketResponseDto[]> => {
        const response = await apiClient.get<TicketResponseDto[]>('/maintenance-tickets/my', config);
        return response.data;
    },

    // 2. جلب تذكرة معينة عن طريق الـ ID
    getTicketById: async (id: string, config?: AxiosRequestConfig): Promise<TicketResponseDto> => {
        const response = await apiClient.get<TicketResponseDto>(`/maintenance-tickets/${id}`, config);
        return response.data;
    },

    // 3. إنشاء تذكرة صيانة جديدة (ترجع الـ Guid الخاص بالتذكرة المنشأة)
    createTicket: async (dto: CreateTicketDto, config?: AxiosRequestConfig): Promise<CreateTicketResponseDto> => {
        const response = await apiClient.post<CreateTicketResponseDto>('/maintenance-tickets', dto, config);
        return response.data;
    },

    // 4. تحديث بيانات التذكرة
    updateTicket: async (id: string, dto: UpdateTicketDto, config?: AxiosRequestConfig): Promise<void> => {
        await apiClient.put(`/maintenance-tickets/${id}`, dto, config);
    },

    // 5. إلغاء التذكرة من قبل المستأجر
    cancelTicket: async (id: string, config?: AxiosRequestConfig): Promise<void> => {
        await apiClient.put(`/maintenance-tickets/${id}/cancel`, {}, config);
    },

    // 6. رفع صورة وإرفاقها بالتذكرة
    uploadTicketImage : async (ticketId: string, file: File, config?: AxiosRequestConfig): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<{ url: string }>(
            `/maintenance-tickets/${ticketId}/images`,
            formData,
            {
                ...config,
                headers: {
                    ...config?.headers,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }
};