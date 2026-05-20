import apiClient from '../api/apiClient';
import type { AxiosRequestConfig } from 'axios';
import type {
    ExpectedPayment,
    OverduePayment,
    AccountingStats,
    PaymentHistoryResponseDto,
    PaymentFilterType
} from '../types/accounting';

export const accountingService = {
    getExpected: async (startDate?: string, endDate?: string): Promise<ExpectedPayment[]> => {
        const response = await apiClient.get<ExpectedPayment[]>('/Accounting/Expected', {
            params: {
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
            }
        });
        return response.data;
    },

    getOverdue: async (startDate?: string, endDate?: string): Promise<OverduePayment[]> => {
        const response = await apiClient.get<OverduePayment[]>('/Accounting/Overdue', {
            params: {
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
            }
        });
        return response.data;
    },

    getStats: async (
        month?: number,
        year?: number,
        startDate?: string,
        endDate?: string,
        rangeMonths?: number
    ): Promise<AccountingStats> => {
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
    },
    getMyPaymentHistory: async (
        filter: PaymentFilterType,
        config?: AxiosRequestConfig
    ): Promise<PaymentHistoryResponseDto[]> => {
        const response = await apiClient.get<PaymentHistoryResponseDto[]>('/Accounting/history', {
            ...config,
            params: { filter, ...(config?.params ? config.params : {}) }
        });
        return response.data;
    }
};
