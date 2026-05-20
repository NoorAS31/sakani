export interface PaymentSimulationDto {
    paymentId: string;
    cardNumber: string;
    cardHolderName: string;
    expiryDate: string;
    cvv: string;
}

export interface PaymentSimulationResponse {
    message: string;
    transactionId: string;
}

