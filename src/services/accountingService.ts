import apiClient from '../api/apiClient';
import type { AxiosRequestConfig } from 'axios';
import type {
    ExpectedPayment,
    OverduePayment,
    AccountingStats,
    PaymentHistoryResponseDto,
    PaymentFilterType
} from '../types/accounting';

const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const accountingService = {
    getExpected: async (startDate?: string, endDate?: string): Promise<ExpectedPayment[]> => {
        try {
            const response = await apiClient.get<ExpectedPayment[]>('/Accounting/Expected', {
                params: {
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {}),
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    getOverdue: async (startDate?: string, endDate?: string): Promise<OverduePayment[]> => {
        try {
            const response = await apiClient.get<OverduePayment[]>('/Accounting/Overdue', {
                params: {
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {}),
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    getExpenses: async (startDate: string, endDate: string): Promise<number> => {
        try {
            const response = await apiClient.get<number>('/Accounting/Expenses', {
                params: {
                    startDate,
                    endDate,
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    getStats: async (
        month?: number,
        year?: number,
        startDate?: string,
        endDate?: string,
        rangeMonths?: number
    ): Promise<AccountingStats> => {
        try {
            const now = new Date();
            const response = await apiClient.get<AccountingStats>('/Accounting/Stats', {
                params: {
                    month: month ?? now.getMonth() + 1,
                    year: year ?? now.getFullYear(),
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {}),
                    ...(rangeMonths ? { rangeMonths } : {}),
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    },

    getMyPaymentHistory: async (
        filter: PaymentFilterType,
        config?: AxiosRequestConfig
    ): Promise<PaymentHistoryResponseDto[]> => {
        try {
            const response = await apiClient.get<PaymentHistoryResponseDto[]>('/Accounting/history', {
                ...config,
                params: { filter, ...(config?.params ? config.params : {}) }
            });
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }
};