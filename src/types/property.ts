export interface Property {
    id: string;
    name: string;
    city: string;
    street: string;
    addressRegion: string;
    buildingNo: string;
    propertyType: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
    isDeleted: boolean;
    tenantId: string;
}