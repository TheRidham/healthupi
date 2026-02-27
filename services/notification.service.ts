export interface Notification {
  id: string
  userId: string
  type: "appointment" | "payment" | "message" | "call" | "system"
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: Record<string, unknown>
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  console.log("Fetching notifications:", userId)
  return []
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  console.log("Marking notification as read:", notificationId)
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  console.log("Marking all notifications as read:", userId)
}

export async function deleteNotification(notificationId: string): Promise<void> {
  console.log("Deleting notification:", notificationId)
}

export async function sendPushNotification(userId: string, notification: Omit<Notification, "id" | "createdAt" | "read">): Promise<void> {
  console.log("Sending push notification:", userId, notification)
}
