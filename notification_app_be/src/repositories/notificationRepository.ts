import { randomUUID } from 'crypto';
import { Notification, NotificationCreatePayload } from '../types/notification';

const notifications: Notification[] = [];

export const notificationRepository = {
  create(payload: NotificationCreatePayload): Notification {
    const now = new Date().toISOString();
    const notification: Notification = {
      id: randomUUID(),
      recipientId: payload.recipientId,
      title: payload.title,
      body: payload.body,
      type: payload.type ?? 'in-app',
      isRead: false,
      createdAt: now,
      updatedAt: now,
      metadata: payload.metadata,
    };

    notifications.push(notification);
    return notification;
  },

  findByRecipient(recipientId: string, isRead?: boolean): Notification[] {
    return notifications
      .filter((notification) => notification.recipientId === recipientId)
      .filter((notification) => (typeof isRead === 'boolean' ? notification.isRead === isRead : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  findById(id: string): Notification | undefined {
    return notifications.find((notification) => notification.id === id);
  },

  markAsRead(id: string): Notification | undefined {
    const notification = this.findById(id);
    if (!notification) {
      return undefined;
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.updatedAt = new Date().toISOString();
    }

    return notification;
  },
};
