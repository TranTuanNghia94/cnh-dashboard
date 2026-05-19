import { getBatchImportToastDescription } from '@/lib/notification-copy'
import type { INotification } from '@/types/notification'

export const getBatchOrderImportToastDescription = (notification: INotification): string =>
  getBatchImportToastDescription(notification)
