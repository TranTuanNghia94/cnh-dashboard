import type {
  ExportJobStatus,
  ExportJobType,
  IExportJobNotificationMetadata,
} from '@/types/export-job'
import type { INotification } from '@/types/notification'

export const EXPORT_JOB_TYPE_LABELS: Record<ExportJobType, string> = {
  PRODUCTS: 'Hàng hóa',
  VENDORS: 'Nhà cung cấp',
  CUSTOMERS: 'Khách hàng',
  WAREHOUSE_INVENTORY: 'Tồn kho',
}

export const EXPORT_JOB_STATUS_LABELS: Record<ExportJobStatus, string> = {
  PENDING: 'Đang chờ',
  RUNNING: 'Đang xử lý',
  SUCCESS: 'Hoàn thành',
  FAILED: 'Thất bại',
}

export const EXPORT_JOB_STATUS_VARIANTS: Record<
  ExportJobStatus,
  'success' | 'destructive' | 'warning' | 'secondary'
> = {
  PENDING: 'secondary',
  RUNNING: 'warning',
  SUCCESS: 'success',
  FAILED: 'destructive',
}

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const isExportJobType = (value: unknown): value is ExportJobType =>
  value === 'PRODUCTS' ||
  value === 'VENDORS' ||
  value === 'CUSTOMERS' ||
  value === 'WAREHOUSE_INVENTORY'

export const parseExportJobMetadata = (
  metadata: unknown,
): IExportJobNotificationMetadata | null => {
  if (!metadata) return null

  let parsed: unknown = metadata
  if (typeof metadata === 'string') {
    const trimmed = metadata.trim()
    if (!trimmed) return null
    try {
      parsed = JSON.parse(trimmed) as unknown
    } catch {
      return null
    }
  }

  if (!parsed || typeof parsed !== 'object') return null
  const raw = parsed as Record<string, unknown>
  if (raw.kind !== 'EXPORT_JOB' || !isExportJobType(raw.type)) return null

  const jobId = asString(raw.jobId)
  if (!jobId) return null

  return {
    kind: 'EXPORT_JOB',
    schemaVersion: asNumber(raw.schemaVersion, 1),
    jobId,
    type: raw.type,
    fileName: asString(raw.fileName) || undefined,
    totalRows: typeof raw.totalRows === 'number' ? raw.totalRows : undefined,
    downloadUrl: asString(raw.downloadUrl) || undefined,
  }
}

export const isExportJobNotification = (notification: INotification): boolean => {
  if (notification.referenceType === 'EXPORT_JOB') return true
  return parseExportJobMetadata(notification.metadata) != null
}

export const getExportJobMetadataFromNotification = (
  notification: INotification,
): IExportJobNotificationMetadata | null => {
  return parseExportJobMetadata(notification.metadata)
}
