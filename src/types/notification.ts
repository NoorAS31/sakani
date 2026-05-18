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
  PaymentOverdue: 1,
  MaintenanceEscalation: 2,
  ContractRenewalReminder: 3,
  ContractOverstayAlert: 4,
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationTypeLabel: Record<NotificationTypeValue, string> = {
  1: 'Payment Overdue',
  2: 'Maintenance Escalation',
  3: 'Contract Renewal Reminder',
  4: 'Contract Overstay Alert',
};

