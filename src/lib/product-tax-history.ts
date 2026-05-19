import type { IResponsePaginationAndSearch } from '@/types/api'
import type { IGenericResponse } from '@/types/other'
import type { IProductTaxHistoryItem, TProductTaxHistorySourceType } from '@/types/product-tax-history'

export const PRODUCT_TAX_SOURCE_LABELS: Record<string, string> = {
  WAREHOUSE_INBOUND_RECEIPT_LINE: 'Nhập kho (dòng phiếu)',
}

export function productTaxSourceLabel(sourceType: TProductTaxHistorySourceType | undefined): string {
  if (!sourceType?.trim()) return '—'
  return PRODUCT_TAX_SOURCE_LABELS[sourceType] ?? sourceType
}

export function formatProductTaxPercent(value: string | number | undefined | null): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  return Number.isFinite(n) ? `${n}%` : String(value)
}

export function productTaxChangeDelta(oldTax: string, newTax: string): number | null {
  const oldN = Number(oldTax)
  const newN = Number(newTax)
  if (!Number.isFinite(oldN) || !Number.isFinite(newN)) return null
  return Math.round((newN - oldN) * 100) / 100
}

export function parseProductTaxHistoryResponse(
  response: IGenericResponse<IResponsePaginationAndSearch<IProductTaxHistoryItem>> | undefined,
): { rows: IProductTaxHistoryItem[]; total: number } {
  if (!response?.data) {
    return { rows: [], total: 0 }
  }

  const payload = response.data
  if (Array.isArray(payload)) {
    return { rows: payload, total: payload.length }
  }

  const rows = payload.data ?? []
  const total = payload.pagination?.total ?? rows.length
  return { rows, total }
}

export function productTaxHistoryErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('errorMessage' in error && typeof (error as { errorMessage?: string }).errorMessage === 'string') {
      return (error as { errorMessage: string }).errorMessage
    }
    if ('message' in error && typeof (error as { message?: string }).message === 'string') {
      return (error as { message: string }).message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Không tải được lịch sử thuế'
}

export function formatProductTaxChangeDelta(oldTax: string, newTax: string): string {
  const delta = productTaxChangeDelta(oldTax, newTax)
  if (delta == null) return '—'
  if (delta === 0) return '0%'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}%`
}
