export interface ExpectedPayment {
    paymentId: string;
    amount: number;
    dueDate: string;
    paymentStatus: number;
    contractId: string;
    renterName: string;
    renterPhoneNumber: string;
    propertyName: string;
    unitNo: string;
    daysUntilDue: number;
}

export interface OverduePayment {
    paymentId: string;
    amount: number;
    dueDate: string;
    paymentStatus: number;
    contractId: string;
    renterName: string;
    renterPhoneNumber: string;
    propertyName: string;
    unitNo: string;
    daysUntilDue: number;
}

export interface AccountingStats {
    totalExpectedMonth: number;
    totalCollectedMonth: number;
    occupancyRate: number;
    expensesMonth: number;
    netIncomeMonth: number;
}
