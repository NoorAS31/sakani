// src/types/auth.ts
export interface UserToken {
    user_id: string;
    tenant_id: string;
    role: "superAdmin" |"tenant" | "rental";
    exp: number;
}

// src/types/schema.ts
export interface Property {
    property_id: string;
    property_name: string;
    city: string;
    tenant_id: string;
    is_deleted: boolean;
}

// Note: Using your string-based status preference
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface MaintenanceTicket {
    ticket_id: string;
    subject: string;
    description: string;
    tickets_status: MaintenanceStatus;
    unit_id: string;
}