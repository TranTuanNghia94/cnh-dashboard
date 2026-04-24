import * as XLSX from 'xlsx'

/** Headers aligned with `ImportPurchaseExcelModal` (`normalizeHeader` + `pick` keys). */
export const PURCHASE_LINE_EXCEL_HEADERS = [
  'PRODUCT_CODE',
  'PRODUCT_NAME',
  'VENDOR_CODE',
  'VENDOR_NAME',
  'QUANTITY',
  'UNIT_PRICE',
  'CURRENCY',
  'EXCHANGE_RATE',
  'UOM1',
  'TAX',
  'QUOTE',
  'INVOICE',
  'RECEIPT_WAREHOUSE',
  'BILL_OF_LADING',
  'TRACK_ID',
  'NOTE',
] as const

export type PurchaseLineExcelExportRow = {
  product?: { code?: string; name?: string }
  vendor?: { code?: string; name?: string }
  quantity?: number
  unitPrice?: number
  currency?: string
  exchangeRate?: number
  uom1?: string
  tax?: number
  quote?: string
  invoice?: string
  receiptWarehouse?: string
  billOfLadding?: string
  trackId?: string
  note?: string
}

function rowValues(line: PurchaseLineExcelExportRow): (string | number)[] {
  return [
    line.product?.code ?? '',
    line.product?.name ?? '',
    line.vendor?.code ?? '',
    line.vendor?.name ?? '',
    Number(line.quantity ?? 0),
    Number(line.unitPrice ?? 0),
    String(line.currency ?? 'VND').toUpperCase() || 'VND',
    Number(line.exchangeRate ?? 1),
    line.uom1 ?? '',
    Number(line.tax ?? 0),
    line.quote ?? '',
    line.invoice ?? '',
    line.receiptWarehouse ?? '',
    line.billOfLadding ?? '',
    line.trackId ?? '',
    line.note ?? '',
  ]
}

/** Build .xlsx for current lines; same shape as import template so users can edit and upload again. */
export function downloadPurchaseOrderLinesExcel(lines: PurchaseLineExcelExportRow[], fileName: string): void {
  const aoa: (string | number)[][] = [[...PURCHASE_LINE_EXCEL_HEADERS], ...lines.map(rowValues)]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Chi tiet don mua hang')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as Uint8Array
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
