import apiClient from '../api/apiClient';
import {storage} from "../utils/storage.ts";
import type {UserAccount} from "../types/userAccount.ts";

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
    login: async (credentials:  {email: string; password: string;}): Promise<LoginResponse> => {
        const response = await apiClient.post('/Auth/login', credentials);
        return response.data;
    },

    registerRenterUser: async (renterId: string, data: RegisterRenterUserRequest): Promise<UserAccount> => {
        const response = await apiClient.post(`/Auth/register-renter/${renterId}`, data);
        return response.data;
    },

    registerTenantUser: async (tenantId: string, data: RegisterTenantUserRequest): Promise<UserAccount> => {
        const response = await apiClient.post(`/Auth/register-tenant/${tenantId}`, data);
        return response.data;
    },

    handleLoginSuccess: (data: LoginResponse, remember:boolean) => {
        storage.setLoginData(data, remember);

    }
};