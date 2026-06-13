export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const notifications: Map<string, InAppNotification[]> = new Map();

export function createNotification(
  userId: string,
  title: string,
  body: string,
  type: InAppNotification["type"] = "info",
  link?: string,
): InAppNotification {
  const notif: InAppNotification = {
    id: crypto.randomUUID(),
    userId,
    title,
    body,
    type,
    read: false,
    link,
    createdAt: new Date(),
  };
  const userNotifs = notifications.get(userId) || [];
  userNotifs.push(notif);
  notifications.set(userId, userNotifs);
  return notif;
}

export function getNotifications(userId: string, unreadOnly = false): InAppNotification[] {
  const userNotifs = notifications.get(userId) || [];
  return unreadOnly ? userNotifs.filter((n) => !n.read) : [...userNotifs].reverse();
}

export function markAsRead(userId: string, notificationId: string): void {
  const userNotifs = notifications.get(userId) || [];
  const notif = userNotifs.find((n) => n.id === notificationId);
  if (notif) notif.read = true;
}

export function markAllAsRead(userId: string): void {
  const userNotifs = notifications.get(userId) || [];
  userNotifs.forEach((n) => (n.read = true));
}
