import apiClient from '../api/apiClient';
import type { PaymentSimulationDto, PaymentSimulationResponse } from '../types/payment';

export const paymentService = {
    simulatePayment: async (
        dto: PaymentSimulationDto,
        options?: { signal?: AbortSignal }
    ): Promise<PaymentSimulationResponse> => {
        const response = await apiClient.post<PaymentSimulationResponse>(
            '/Payments/simulate',
            {
                paymentId: dto.paymentId,
                cardNumber: dto.cardNumber,
                cardHolderName: dto.cardHolderName,
                expiryDate: dto.expiryDate,
                cvv: dto.cvv
            },
            { signal: options?.signal }
        );
        return response.data;
    }
};