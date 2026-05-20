import apiClient from '../api/apiClient';

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

export const taskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await apiClient.get('/tasks');
        return response.data;
    },

    create: async (task: Partial<Task>): Promise<Task> => {
        const response = await apiClient.post('/tasks', task);
        return response.data;
    },


    updateStatus: async (taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'DONE'): Promise<Task> => {
        // We send only the status string in the body
        const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
        return response.data;
    }
};