import apiClient from '../api/apiClient';
import type {Tenant} from '../types/tenant';


const transformTenantResponse = (data: Tenant): Tenant => {
    const transformed: Tenant = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressRegion: data.addressRegion,
        status: data.status,
        userId: data.userId
    };
    return transformed;
};

export interface TenantMeResponse {
    id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    addressCity?: string;
    status?: string;
}

export const tenantService = {
    getAllTenants: async (): Promise<Tenant[]> => {
        const response = await apiClient.get<Tenant[]>('/Tenants');
        return response.data.map(transformTenantResponse);
    },

    create: async (data: Tenant): Promise<string> => {
        const response = await apiClient.post<string>('/Tenants', data);
        return response.data;
    },

    update: async (id: string, data: Tenant): Promise<void> => {
        await apiClient.put(`/Tenants/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/Tenants/${id}`);
    },

    getMe: async (): Promise<TenantMeResponse> => {
        const response = await apiClient.get<TenantMeResponse>('/tenants/me');
        return response.data;
    }

};