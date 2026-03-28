
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
    area: string;
    rentPrice: number;
    propertyId: string;
    UnitStatus:  unitStatus;
    tenantId: string;
}