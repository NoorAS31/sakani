export interface TicketResponseDto {
    id: string;
    unitId: string;
    unitNo: string;
    subject: string;
    description: string;
    status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
    createdAt: string;
    images: TicketImageDto[];
}

export interface TicketImageDto {
    id: string;
    imageUrl: string;
}
export interface CreateTicketDto {
    subject: string;
    description: string;
}

export interface UpdateTicketDto {
    id: string;
    subject: string;
    description: string;
}
export interface CreateTicketResponseDto {
    ticketId: string;
}
