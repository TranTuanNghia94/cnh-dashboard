import { parseBatchOrderImportMetadata } from '@/lib/batch-order-import-notification'
import type { INotification } from '@/types/notification'

export const getBatchOrderImportToastDescription = (notification: INotification): string => {
  const meta = parseBatchOrderImportMetadata(notification.metadata)
  if (!meta) return notification.message

  const { summary } = meta
  const parts = [notification.message]
  const stats: string[] = []

  if (summary.ordersCreatedCount > 0) stats.push(`${summary.ordersCreatedCount} đơn`)
  if (summary.newProductsCount > 0) stats.push(`${summary.newProductsCount} SP mới`)
  if (summary.newVendorsCount > 0) stats.push(`${summary.newVendorsCount} NCC mới`)
  if (summary.warningCount > 0) stats.push(`${summary.warningCount} cảnh báo`)
  if (summary.errorCount > 0) stats.push(`${summary.errorCount} lỗi`)

  if (stats.length > 0) parts.push(stats.join(' · '))

  return parts.filter(Boolean).join(' — ')
}
