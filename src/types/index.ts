
export const MaintenanceStatus = {
    Open : 1,
    InProgress: 2,
    Resolved :3,
    Closed : 4
} as const;

export type maintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];


export interface MaintenanceTicket {
    ticket_id: string;
    subject: string;
    description: string;
    tickets_status: maintenanceStatus;
    unit_id: string;
}