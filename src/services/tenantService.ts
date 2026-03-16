import axios from 'axios';
import type {Tenant} from '../types/tenant';
import {storage} from "../utils/storage.ts";

const API_URL = 'https://localhost:7176/api/tenants';

export const tenantService = {
    getAllTenants: async (): Promise<Tenant[]> => {
        const token = storage.getToken();
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

};