import type {
  IBatchOrderImportMetadata,
  IBatchOrderImportSummary,
} from '@/types/batch-order-import'
import type { INotification } from '@/types/notification'

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const asStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') return JSON.stringify(item)
      return String(item ?? '')
    })
    .filter(Boolean)
}

const parseOrderCreated = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const orderCode = asString(row.orderCode)
  if (!orderCode) return null
  return {
    orderId: asString(row.orderId),
    orderCode,
    contractNumber: asString(row.contractNumber),
    customerCode: asString(row.customerCode),
    lineCount: asNumber(row.lineCount),
  }
}

const parseRowRef = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const code = asString(row.code)
  if (!code) return null
  return {
    code,
    name: asString(row.name),
    rowNum: asNumber(row.rowNum),
  }
}

export const normalizeBatchOrderImportSummary = (
  value: unknown,
): IBatchOrderImportSummary | null => {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>

  const ordersCreated = Array.isArray(raw.ordersCreated)
    ? raw.ordersCreated.map(parseOrderCreated).filter((x): x is NonNullable<typeof x> => Boolean(x))
    : []

  const newProducts = Array.isArray(raw.newProducts)
    ? raw.newProducts.map(parseRowRef).filter((x): x is NonNullable<typeof x> => Boolean(x))
    : []

  const newVendors = Array.isArray(raw.newVendors)
    ? raw.newVendors.map(parseRowRef).filter((x): x is NonNullable<typeof x> => Boolean(x))
    : []

  const warnings = asStringList(raw.warnings)
  const errors = asStringList(raw.errors)

  return {
    totalRows: asNumber(raw.totalRows),
    ordersCreatedCount: asNumber(raw.ordersCreatedCount, ordersCreated.length),
    newProductsCount: asNumber(raw.newProductsCount, newProducts.length),
    newVendorsCount: asNumber(raw.newVendorsCount, newVendors.length),
    warningCount: asNumber(raw.warningCount, warnings.length),
    errorCount: asNumber(raw.errorCount, errors.length),
    ordersCreated,
    newProducts,
    newVendors,
    warnings,
    errors,
  }
}

export const parseBatchOrderImportMetadata = (
  metadata: unknown,
): IBatchOrderImportMetadata | null => {
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
  if (raw.kind !== 'BATCH_ORDER_IMPORT') return null

  const summary = normalizeBatchOrderImportSummary(raw.summary)
  if (!summary) return null

  const jobId = asString(raw.jobId)
  if (!jobId) return null

  return {
    kind: 'BATCH_ORDER_IMPORT',
    schemaVersion: asNumber(raw.schemaVersion, 1),
    jobId,
    summary,
  }
}

export const isBatchOrderImportNotification = (notification: INotification): boolean => {
  if (notification.referenceType === 'BATCH_ORDER_IMPORT') return true
  return parseBatchOrderImportMetadata(notification.metadata) != null
}

export const getBatchOrderImportJobIdFromNotification = (
  notification: INotification,
): string | null => {
  const meta = parseBatchOrderImportMetadata(notification.metadata)
  if (meta?.jobId) return meta.jobId
  if (notification.referenceType === 'BATCH_ORDER_IMPORT' && notification.referenceId) {
    return notification.referenceId
  }
  return null
}

export const getBatchOrderImportSummaryFromNotification = (
  notification: INotification,
): IBatchOrderImportSummary | null => {
  const meta = parseBatchOrderImportMetadata(notification.metadata)
  return meta?.summary ?? null
}
