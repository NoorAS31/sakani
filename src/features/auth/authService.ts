import axios from 'axios';
import {storage} from "../../utils/storage.ts";


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
        storage.setLoginData(data, remember);

    }
};