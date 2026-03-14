export interface Unit {
    id: string;
    unitNo: string;
    floor: string;
    area: number;
    rentPrice: number;
    propertyId: string;
    unitStatus:  'Available'|'Rented'| 'UnderMaintenance' | 'Reserved';
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
    isDeleted: boolean;
    tenantId: string; // The "Read-Only" link we discussed
}