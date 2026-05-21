import { getBatchOrderImportSummaryFromNotification } from '@/lib/batch-order-import-notification'
import { EXPORT_JOB_TYPE_LABELS, getExportJobMetadataFromNotification } from '@/lib/export-job'
import type { IBatchOrderImportSummary } from '@/types/batch-order-import'
import type { INotification } from '@/types/notification'

export function getBatchImportPlainSummary(summary: IBatchOrderImportSummary): string {
  if (summary.errorCount > 0 && summary.ordersCreatedCount === 0) {
    return summary.errorCount === 1
      ? 'Không tạo được đơn hàng. Vui lòng xem lỗi bên dưới.'
      : `Không tạo được đơn hàng. Có ${summary.errorCount} lỗi cần xử lý.`
  }

  const parts: string[] = []

  if (summary.ordersCreatedCount > 0) {
    parts.push(
      summary.ordersCreatedCount === 1
        ? 'Đã tạo 1 đơn hàng'
        : `Đã tạo ${summary.ordersCreatedCount} đơn hàng`,
    )
  }

  if (summary.newProductsCount > 0) {
    parts.push(
      summary.newProductsCount === 1
        ? '1 sản phẩm mới'
        : `${summary.newProductsCount} sản phẩm mới`,
    )
  }

  if (summary.newVendorsCount > 0) {
    parts.push(
      summary.newVendorsCount === 1
        ? '1 nhà cung cấp mới'
        : `${summary.newVendorsCount} nhà cung cấp mới`,
    )
  }

  let text = parts.length > 0 ? parts.join(' · ') : 'Đã xử lý xong file Excel'

  if (summary.warningCount > 0) {
    text +=
      summary.warningCount === 1
        ? '. Có 1 dòng cần kiểm tra thêm'
        : `. Có ${summary.warningCount} dòng cần kiểm tra thêm`
  }

  if (summary.errorCount > 0) {
    text +=
      summary.errorCount === 1
        ? '. Có 1 lỗi cần sửa'
        : `. Có ${summary.errorCount} lỗi cần sửa`
  }

  return text
}

export function getNotificationSubtitle(notification: INotification): string | null {
  const batchSummary = getBatchOrderImportSummaryFromNotification(notification)
  if (batchSummary) return getBatchImportPlainSummary(batchSummary)
  const exportJob = getExportJobMetadataFromNotification(notification)
  if (exportJob) {
    const typeLabel = EXPORT_JOB_TYPE_LABELS[exportJob.type] ?? exportJob.type
    if (exportJob.downloadUrl) {
      const rows =
        typeof exportJob.totalRows === 'number' ? ` (${exportJob.totalRows} dòng)` : ''
      return `File Excel ${typeLabel} đã sẵn sàng${rows}.`
    }
    return `Job xuất Excel ${typeLabel} đã kết thúc nhưng chưa có link tải.`
  }
  return null
}

export function getNotificationActionLabel(notification: INotification): string | null {
  if (notification.referenceType === 'BATCH_ORDER_IMPORT') {
    return 'Xem kết quả tải file'
  }
  const exportJob = getExportJobMetadataFromNotification(notification)
  if (exportJob?.downloadUrl) return 'Tải Excel'
  if (exportJob) return 'Xem lịch sử'
  if (notification.actionUrl) return 'Mở'
  return null
}

export function getBatchImportDialogTitle(notification: INotification | null): string {
  if (!notification) return 'Kết quả tải file đơn hàng'

  const summary = getBatchOrderImportSummaryFromNotification(notification)
  if (!summary) return 'Kết quả tải file đơn hàng'

  if (summary.errorCount > 0 && summary.ordersCreatedCount === 0) {
    return 'Tải file không thành công'
  }
  if (summary.warningCount > 0 || summary.errorCount > 0) {
    return 'Tải file xong — cần kiểm tra thêm'
  }
  return 'Tải file thành công'
}

export function getBatchImportToastDescription(notification: INotification): string {
  const summary = getBatchOrderImportSummaryFromNotification(notification)
  if (summary) return getBatchImportPlainSummary(summary)
  return notification.message || 'File Excel đã được xử lý xong.'
}
