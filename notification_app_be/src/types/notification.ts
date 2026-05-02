export type NotificationType = 'email' | 'sms' | 'in-app' | 'alert';

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export interface NotificationCreatePayload {
  recipientId: string;
  title: string;
  body: string;
  type?: NotificationType;
  metadata?: Record<string, string>;
}
