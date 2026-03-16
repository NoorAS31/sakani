import axios from 'axios';
import type { Property } from '../types/property.ts';
import { storage } from '../utils/storage';

const API_URL = 'https://localhost:7176/api/properties';

// Helper to get headers with the token
const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${storage.getToken()}` }
});

export const propertyService = {
    getAll: async (): Promise<Property[]> => {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    },

    getByTenant: async (tenantId: string): Promise<Property[]> => {
        const response = await axios.get(`${API_URL}/tenant/${tenantId}`, getAuthHeaders());
        return response.data;
    },

    create: async (property: Partial<Property>): Promise<Property> => {
        const response = await axios.post(API_URL, property, getAuthHeaders());
        return response.data;
    },

    update: async (id: string, property: Partial<Property>): Promise<Property> => {
        const response = await axios.put(`${API_URL}/${id}`, property, getAuthHeaders());
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    }
};