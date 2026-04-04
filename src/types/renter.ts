import type {Contract} from "./contract.ts";

export interface Renter {
    id: string;
    nationalId: string;
    phoneNumber: string;
    userId?: string;
    description?: string;
    // These usually come flattened in a Response DTO
    fullName?: string;
    email?: string;
    // We'll leave contracts as an empty array for now
    contracts?: Contract[];
}

export interface CreateRenterDto {
    fullName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
    description: string;
}