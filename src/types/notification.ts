export interface Notification {
  id: string;
  userId: string;
  senderId: string | null;
  title: string;
  message: string;
  type: number;
  referenceId: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export const NotificationType = {
  Info: 0,
  Warning: 1,
  Error: 2,
  ContractExpiry: 3,
  MaintenanceUpdate: 4,
  PaymentReminder: 5,
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

