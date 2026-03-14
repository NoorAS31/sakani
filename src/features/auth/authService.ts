import axios from 'axios';

const API_URL = 'https://localhost:7176/api/Auth';

export interface LoginResponse {
    token: string;
    userId: string;
    role: 'SuperAdmin' | 'Tenant' | 'Renter';
    tenantId: string;
}

export const authService = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data;
    },

    handleLoginSuccess: (data: LoginResponse, remember:boolean) => {

        const storage = remember? localStorage : sessionStorage;

        storage.setItem('token', data.token);
        storage.setItem('role', data.role);
        storage.setItem('tenantId', data.tenantId);
    }
};