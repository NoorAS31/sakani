import axios from 'axios';
import { storage } from '../utils/storage';

const apiClient = axios.create({
    baseURL: 'http://68.183.216.106/',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't auto-redirect on 403 - let components handle permission errors gracefully
        return Promise.reject(error);
    }
);

export default apiClient;