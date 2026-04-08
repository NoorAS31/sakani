export const ContractStatus = {
    Draft : 1,
    Active : 2,
    Expired : 3,
    Terminated : 4
} as const;

export type contractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const PaymentFrequency = {
    Monthly: 1,
    Quarterly: 3,
    SemiAnnually: 6,
    Yearly: 12
} as const;

export type paymentFrequency = (typeof PaymentFrequency)[keyof typeof PaymentFrequency];

export interface Contract {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    contractStatus: contractStatus;
    paymentFreq: paymentFrequency;
    unitId: string;
    renterId: string;
    tenantId: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    isDeleted: boolean;
}

export interface CreateContractDto {
    startDate: string;
    endDate: string;
    rentAmount: number;
    unitId: string;
    renterId: string;
    contractStatus: number;
    paymentFreq: number;
}

export const PaymentStatus = {
    Pending: 1,
    Paid: 2,
    Overdue: 3
} as const;

export type paymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Payment {
    id: string;
    amount: number;
    dueDate: string;
    paymentDate: string | null;
    paymentStatus: paymentStatus;
}

export interface ContractDetails {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    contractStatus: contractStatus;
    unitId: string;
    renterId: string;
    payments: Payment[];
}