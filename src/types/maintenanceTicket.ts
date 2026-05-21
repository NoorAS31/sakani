export const MaintenanceTicketStatus = {
    Open: 1,
    InProgress: 2,
    Resolved: 3,
    Closed: 4
} as const;

export type MaintenanceTicketStatusType = typeof MaintenanceTicketStatus[keyof typeof MaintenanceTicketStatus];

export interface MaintenanceImage {
    id: string;
    imageUrl: string;
}

export interface MaintenanceTicket {
    id: string;
    unitId: string;
    unitNo: string;
    subject: string;
    description: string;
    status: MaintenanceTicketStatusType | string;
    createdAt: string;
    images: MaintenanceImage[];
}

export interface CreateMaintenanceTicketDto {
    unitId: string;
    subject: string;
    description: string;
}

export interface UpdateMaintenanceTicketDto {
    id: string;
    subject: string;
    description: string;
}

export interface UpdateMaintenanceTicketStatusDto {
    ticketId: string;
    newStatus: MaintenanceTicketStatusType;
}
