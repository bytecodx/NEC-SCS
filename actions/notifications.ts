"use server";

import { requireUser } from "@/lib/auth/session";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications/dispatcher";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
  const user = await requireUser();
  const notifications = await getUserNotifications(user.profile.id);
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  return {
    notifications,
    unreadCount,
  };
}

export async function markNotificationReadAction(id: string) {
  const user = await requireUser();
  const success = await markNotificationAsRead(id, user.profile.id);
  revalidatePath("/student/notifications");
  revalidatePath("/faculty/notifications");
  return { success };
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  const count = await markAllNotificationsAsRead(user.profile.id);
  revalidatePath("/student/notifications");
  revalidatePath("/faculty/notifications");
  return { success: true, count };
}
