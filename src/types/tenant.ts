export interface Tenant {
    id: string; // or number, based on your DB
    name: string;
    addressCity: string;
    addressStreet: string;
    addressRegion: string;
    email: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
    isDeleted: boolean;
    // Hidden in the main view but available in the "Detail" view
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
}