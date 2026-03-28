import axios from 'axios';
import { storage } from '../utils/storage';

const apiClient = axios.create({
    baseURL: 'https://localhost:7176/api', // Your .NET Backend URL
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
        if (error.response?.status === 403) {
            console.error("Unauthorized! Logging out...");
            window.location.href = '/dashboard';
        }
        return Promise.reject(error);
    }
);

export default apiClient;