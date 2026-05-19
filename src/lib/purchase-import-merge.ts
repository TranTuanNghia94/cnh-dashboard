import type { IPurchaseOrderLineCreateRequest } from '@/types/purchase'

export type PurchaseLineMergeable = IPurchaseOrderLineCreateRequest & {
  clientLineId: string
}

/** Recalculate totals after import merge so currency / exchange rate changes apply. */
export function recalcPurchaseLineTotals<T extends PurchaseLineMergeable>(line: T): T {
  const quantity = Number(line.quantity ?? 0)
  const unitPrice = Number(line.unitPrice ?? 0)
  const tax = Number(line.tax ?? 0)
  const totalBeforeTax = quantity * unitPrice
  const taxAmount = line.isTaxIncluded ? 0 : (totalBeforeTax * tax) / 100
  const totalPrice = totalBeforeTax + taxAmount
  const currency = String(line.currency ?? 'VND').trim().toUpperCase() || 'VND'
  const exchangeRate = currency === 'VND' ? 1 : Number(line.exchangeRate ?? 1)

  return {
    ...line,
    currency,
    exchangeRate,
    totalBeforeTax,
    totalPrice,
    totalPriceVnd: currency === 'VND' ? totalPrice : totalPrice * exchangeRate,
  }
}

/** Fallback when Excel has no LINE_ID — same product/vendor/order line, not quote/invoice. */
function buildFallbackMergeKey(
  line: Pick<PurchaseLineMergeable, 'productId' | 'vendorId' | 'saleOrderLineId'>,
): string {
  return [
    String(line.productId ?? ''),
    String(line.vendorId ?? ''),
    String(line.saleOrderLineId ?? ''),
  ].join('|')
}

/**
 * Merge imported PO lines into existing rows.
 * Prefer LINE_ID (clientLineId) from export so quote/invoice edits update in place.
 */
export function mergeImportedPurchaseLines<T extends PurchaseLineMergeable>(
  existing: T[],
  imported: T[],
): T[] {
  if (imported.length === 0) return existing

  const next = [...existing]
  const idToIndex = new Map(existing.map((line, index) => [line.clientLineId, index]))
  const fallbackKeyToIndex = new Map<string, number>()
  existing.forEach((line, index) => {
    const key = buildFallbackMergeKey(line)
    if (!fallbackKeyToIndex.has(key)) {
      fallbackKeyToIndex.set(key, index)
    }
  })

  imported.forEach((line) => {
    let existingIndex: number | undefined

    if (line.clientLineId && idToIndex.has(line.clientLineId)) {
      existingIndex = idToIndex.get(line.clientLineId)
    } else {
      existingIndex = fallbackKeyToIndex.get(buildFallbackMergeKey(line))
    }

    if (existingIndex === undefined) {
      next.push(recalcPurchaseLineTotals(line))
      const newIndex = next.length - 1
      if (line.clientLineId) idToIndex.set(line.clientLineId, newIndex)
      const fallbackKey = buildFallbackMergeKey(line)
      if (!fallbackKeyToIndex.has(fallbackKey)) {
        fallbackKeyToIndex.set(fallbackKey, newIndex)
      }
      return
    }

    const oldLine = next[existingIndex]
    const merged = {
      ...oldLine,
      ...line,
      id: oldLine.id || line.id,
      clientLineId: oldLine.clientLineId,
      purchaseOrderId: oldLine.purchaseOrderId || line.purchaseOrderId,
      saleOrderLineId: oldLine.saleOrderLineId || line.saleOrderLineId,
    } as T

    const oldWithSale = oldLine as T & { saleOrderLine?: unknown }
    const lineWithSale = line as T & { saleOrderLine?: unknown }
    if ('saleOrderLine' in oldLine || 'saleOrderLine' in line) {
      ;(merged as T & { saleOrderLine?: unknown }).saleOrderLine =
        oldWithSale.saleOrderLine ?? lineWithSale.saleOrderLine
    }

    next[existingIndex] = recalcPurchaseLineTotals(merged)
  })

  return next
}
