import { getDB } from "@/lib/db/store";
import { Notification } from "@/types/database.types";

export interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function sendNotification(params: SendNotificationParams): Promise<Notification> {
  const db = getDB();
  const notification: Notification = {
    id: crypto.randomUUID(),
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    entity_type: params.entityType || null,
    entity_id: params.entityId || null,
    read_at: null,
    created_at: new Date().toISOString(),
  };

  db.notifications.unshift(notification);
  return notification;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const db = getDB();
  return db.notifications.filter((n) => n.user_id === userId);
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  const db = getDB();
  const notification = db.notifications.find((n) => n.id === notificationId && n.user_id === userId);
  if (notification) {
    notification.read_at = new Date().toISOString();
    return true;
  }
  return false;
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const db = getDB();
  let count = 0;
  db.notifications.forEach((n) => {
    if (n.user_id === userId && !n.read_at) {
      n.read_at = new Date().toISOString();
      count++;
    }
  });
  return count;
}
