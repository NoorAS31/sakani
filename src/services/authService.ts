import apiClient from '../api/apiClient';
import {storage} from "../utils/storage.ts";


const API_URL = '/Auth';

export interface LoginResponse {
    token: string;
    userId: string;
    role: 'SuperAdmin' | 'Tenant' | 'Renter';
    tenantId: string;
}
export interface RegisterRenterUserRequest {
    email: string;
    password: string;
    name: string;
}

export interface RegisterTenantUserRequest {
    email: string;
    password: string;
    name: string;
}

export const authService = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await apiClient.post(`${API_URL}/login`, credentials);
        return response.data;
    },

    registerRenterUser: async (renterId: string, data: RegisterRenterUserRequest): Promise<any> => {
        const response = await apiClient.post(`${API_URL}/register-renter/${renterId}`, data);
        return response.data;
    },

    registerTenantUser: async (tenantId: string, data: RegisterTenantUserRequest): Promise<any> => {
        const response = await apiClient.post(`${API_URL}/register-tenant/${tenantId}`, data);
        return response.data;
    },

    handleLoginSuccess: (data: LoginResponse, remember:boolean) => {
        storage.setLoginData(data, remember);

    }
};