export type NotificationType =
  | 'SUCCESS'
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | 'APPROVAL'
  | string

export type NotificationCategory =
  | 'PAYMENT_REQUEST'
  | 'APPROVAL'
  | string

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | string

export type NotificationReferenceType = 'PAYMENT_REQUEST' | string

export interface INotification {
  id: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  referenceId: string
  referenceType: NotificationReferenceType
  actionUrl: string
  isRead: boolean
  priority: NotificationPriority
  createdAt: string
}

export interface INotificationsInbox {
  totalCount: number
  unreadCount: number
  notifications: INotification[]
}

export interface INotificationInitPayload {
  unreadCount: number
}
