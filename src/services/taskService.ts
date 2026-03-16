import axios from 'axios';
import { storage } from '../utils/storage';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    priority: string;
    propertyId: string;
    unitId: string;
    tenantId: string;
    createdBy: string;
    createdAt: string;
}

const API_URL = 'https://localhost:7176/api/tasks';

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${storage.getToken()}` }
});

export const taskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    },

    create: async (task: Partial<Task>): Promise<Task> => {
        const response = await axios.post(API_URL, task, getAuthHeaders());
        return response.data;
    },


    updateStatus: async (taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE'): Promise<Task> => {
        // We send only the status string in the body
        const response = await axios.patch(`${API_URL}/${taskId}/status`, { status }, getAuthHeaders());
        return response.data;
    }
};