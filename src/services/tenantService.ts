import axios from 'axios';
import type {Tenant} from '../types/tenant';

const API_URL = 'https://localhost:7176/api/tenants';

export const tenantService = {
    getAllTenants: async (): Promise<Tenant[]> => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

};