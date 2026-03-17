
export const TenantStatus = {
    Active:1,
    Suspended:2,
    Inactive:3

} as const;

export type tenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export interface Tenant {
    id: string; // or number, based on your DB
    name: string;
    addressCity: string;
    addressStreet: string;
    addressRegion: string;
    email: string;
    phoneNumber: string;
    status: tenantStatus;
    createdAt: string;
    isDeleted: boolean;
    // Hidden in the main view but available in the "Detail" view
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
}