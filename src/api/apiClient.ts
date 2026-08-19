import axios from 'axios';
import { storage } from '../utils/storage';
import type { AxiosError } from 'axios';

const apiClient = axios.create({
    // Use Vite dev server proxy during local development.
    // The proxy forwards `/api` to the backend at https://localhost:7176
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers = config.headers ?? {};
            // Use concatenation to avoid template literal being redacted in this environment
            (config.headers as Record<string, unknown>).Authorization = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export class ApiError extends Error {
    status?: number;
    validation?: string[] | undefined;
    constructor(message: string, status?: number, validation?: string[] ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.validation = validation;
    }
}

export const parseAxiosError = (error: unknown) => {
    // Normalizes axios errors into a predictable structure for services/components
    if (!axios.isAxiosError(error)) {
        return { status: undefined as number | undefined, message: (error instanceof Error) ? error.message : String(error), validation: undefined as string[] | undefined };
    }

    const axiosErr = error as AxiosError<unknown>;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data as any;

    let validation: string[] | undefined = undefined;
    if (data) {
        // FluentValidation / ProblemDetails style: errors as dictionary
        if (Array.isArray(data.validationErrors)) {
            validation = data.validationErrors;
        } else if (data.errors && typeof data.errors === 'object') {
            validation = Object.values(data.errors).flat().map((v: unknown) => String(v));
        } else if (Array.isArray(data.errors)) {
            validation = data.errors.map(String);
        }

        // Some middleware return 'errors' as key for validation problems
        if (!validation && data.error && typeof data.error === 'object' && data.error.errors) {
            const errs = data.error.errors;
            if (typeof errs === 'object') validation = Object.values(errs).flat().map((v: unknown) => String(v));
        }
    }

    // Pick the best message available (case-insensitive common keys)
    const messageCandidates = [
        data?.message, data?.Message,
        data?.error, data?.Error,
        data?.title, data?.Title,
        data?.MessageDetail, data?.detail, data?.Detail
    ];

    const foundMessage = messageCandidates.find(m => typeof m === 'string' && m && String(m).trim().length > 0) as string | undefined;
    const message = foundMessage ?? (axiosErr.message || 'API request failed');

    return { status, message: String(message), validation };
};

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't auto-redirect on 403 - let components handle permission errors gracefully
        return Promise.reject(error);
    }
);

export default apiClient;

