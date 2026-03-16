import axios from 'axios';
import type { Unit } from '../types/unit';
import {storage} from "../utils/storage.ts";

const API_URL = 'https://localhost:7176/api/units';

export const unitService = {
    // For SuperAdmin: Get all units in the system
    getAllUnits: async (): Promise<Unit[]> => {
        const token = storage.getToken();
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // For the logged-in Tenant: Get only their units
    getUnitsByTenant: async (tenantId: string): Promise<Unit[]> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/tenant/${tenantId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};