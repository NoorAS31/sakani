import apiClient from '../api/apiClient';
import type {Tenant} from '../types/tenant';

const API_URL = '/Tenants';

const convertStatusStringToNumber = (status: any): number => {
    if (typeof status === 'number') return status;
    if (status === 'Active' || status === 1) return 1;
    if (status === 'Suspended' || status === 2) return 2;
    if (status === 'Inactive' || status === 3) return 3;
    return 1; // Default to Active
};

const transformTenantResponse = (data: any): Tenant => {
    const transformed: Tenant = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        addressStreet: data.addressStreet,
        addressCity: data.addressCity,
        addressRegion: data.addressRegion,
        status: convertStatusStringToNumber(data.status),
        userId: data.userId
    };
    return transformed;
};

export const tenantService = {
    getAllTenants: async (): Promise<Tenant[]> => {
        const response = await apiClient.get<any[]>(API_URL);
        return response.data.map(transformTenantResponse);
    },

    create: async (data: any): Promise<string> => {
        const response = await apiClient.post<string>(API_URL, data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<void> => {
        await apiClient.put(`${API_URL}/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/${id}`);
    }

};