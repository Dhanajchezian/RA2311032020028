import { Notification, NotificationCreatePayload } from '../types/notification';
import { notificationRepository } from '../repositories/notificationRepository';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validatePayload(payload: NotificationCreatePayload): void {
  if (!payload.recipientId || payload.recipientId.trim() === '') {
    throw new ValidationError('recipientId is required');
  }

  if (!payload.title || payload.title.trim() === '') {
    throw new ValidationError('title is required');
  }

  if (!payload.body || payload.body.trim() === '') {
    throw new ValidationError('body is required');
  }

  if (payload.metadata && Object.keys(payload.metadata).length > 20) {
    throw new ValidationError('metadata cannot contain more than 20 entries');
  }
}

export const notificationService = {
  create(payload: NotificationCreatePayload): Notification {
    validatePayload(payload);
    return notificationRepository.create(payload);
  },

  list(recipientId: string, isRead?: boolean): Notification[] {
    if (!recipientId || recipientId.trim() === '') {
      throw new ValidationError('recipientId is required to list notifications');
    }

    return notificationRepository.findByRecipient(recipientId, isRead);
  },

  markRead(id: string): Notification {
    const notification = notificationRepository.markAsRead(id);
    if (!notification) {
      throw new NotFoundError(`Notification with id ${id} not found`);
    }
    return notification;
  },
};
