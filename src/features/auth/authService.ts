import axios from 'axios';

const API_URL = 'https://localhost:7176/api/Auth';

export interface LoginResponse {
    token: string;
    userId: string;
    role: 'SuperAdmin' | 'Tenant' | 'Renter'; // Matches your ERD roles
    tenantId: string;
}

export const authService = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data;
    },

    handleLoginSuccess: (data: LoginResponse) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('tenantId', data.tenantId);
    }
};