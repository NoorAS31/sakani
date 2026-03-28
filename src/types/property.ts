
export const PropertyType = {
    Residential: 1,
    Commercial: 2,
    Industrial: 3,
    MixedUse: 4
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export interface Property {
    id: string;
    name: string;
    city: string;
    street: string;
    addressRegion: string;
    buildingNo: string;
    propertyType: string | number ;
    tenantId: string;
}
