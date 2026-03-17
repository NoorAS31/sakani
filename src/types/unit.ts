
export const UnitStatus = {
    Available: 1,
    Rented: 2,
    UnderMaintenance: 3,
    Reserved: 4
} as const;

export type unitStatus = (typeof UnitStatus)[keyof typeof UnitStatus];



export interface Unit {
    id: string;
    unitNo: string;
    floor: string;
    area: number;
    rentPrice: number;
    propertyId: string;
    unitStatus:  unitStatus
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
    isDeleted: boolean;
    tenantId: string; // The "Read-Only" link we discussed
}