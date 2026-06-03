import type {Contract} from "./contract.ts";

export interface Renter {
    id: string;
    nationalId: string;
    phoneNumber: string;
    userId?: string;
    description?: string;
    firstName: string;
    lastName: string;
    contracts?: Contract[];
}

export interface CreateRenterDto {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nationalId: string;
    description: string;
}