import * as XLSX from 'xlsx'

/**
 * Tiêu đề cột tiếng Việt trong file mẫu (dòng 1).
 * Khi làm import Excel, map sang trường tương ứng: mã hàng → productCode, mã NCC → vendorCode, …
 */
export const ORDER_LINE_EXCEL_HEADERS = [
  'Mã hàng',
  'Tên hàng',
  'Mã NCC',
  'Số lượng',
  'Đơn giá',
  'ĐVT',
  'Gồm thuế (1: có / 0: không)',
  'Giáo viên',
  'Phòng',
  'Tham chiếu',
  'Ghi chú',
] as const

export const BATCH_ORDER_EXCEL_HEADERS = [
  'MÃ KH',
  'SỐ HỢP ĐỒNG',
  'NGÀY ĐẶT',
  'MÃ SẢN PHẨM',
  'TÊN SẢN PHẨM',
  'MÃ NCC',
  'TÊN NCC',
  'ĐVT',
  'SỐ LƯỢNG',
  'ĐƠN GIÁ',
  'BAO GỒM THUẾ',
  'GHI CHÚ NHẬN',
  'GHI CHÚ GIAO',
] as const

function downloadSheetTemplate(
  headers: readonly string[],
  sheetName: string,
  fileName: string,
): void {
  const aoa: (string | number)[][] = [[...headers]]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as Uint8Array
  const blob = new Blob([new Uint8Array(buf)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
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

/** Download an empty .xlsx with header row only (template for line items). */
export function downloadOrderLinesExcelTemplate(fileName = 'mau-chi-tiet-don-hang.xlsx'): void {
  downloadSheetTemplate(ORDER_LINE_EXCEL_HEADERS, 'Chi tiết đơn hàng', fileName)
}

/** Download an empty .xlsx with header row only (template for batch order upload). */
export function downloadBatchOrderExcelTemplate(fileName = 'mau-tao-don-hang-hang-loat.xlsx'): void {
  downloadSheetTemplate(BATCH_ORDER_EXCEL_HEADERS, 'Batch order', fileName)
}

/** Backward-compatible alias for batch-order template naming. */
export function downloadOrderBatchExcelTemplate(fileName?: string): void {
  downloadBatchOrderExcelTemplate(fileName)
}

export type ParsedOrderLineExcelRow = {
  rowNumber: number
  productCode: string
  productName: string
  vendorCode: string
  quantity: number
  unitPrice: number
  uom: string
  isIncludedTax: boolean
  receiverNote: string
  deliveryNote: string
  referenceNote: string
  notes: string
}

export type OrderLineExcelParseIssue = {
  rowNumber: number
  messages: string[]
}

export type OrderLineExcelParseResult = {
  headerError?: string
  rows: ParsedOrderLineExcelRow[]
  issues: OrderLineExcelParseIssue[]
}

const HEADER_FIELDS = {
  productCode: 'ma hang',
  productName: 'ten hang',
  vendorCode: 'ma ncc',
  quantity: 'so luong',
  unitPrice: 'don gia',
  uom: 'dvt',
  includedTax: 'gom thue',
  receiverNote: 'giao vien',
  deliveryNote: 'phong',
  referenceNote: 'tham chieu',
  notes: 'ghi chu',
} as const

function headerKey(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function cellText(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value)
  }
  return String(value ?? '').trim().replace(/^'+/, '')
}

function cellNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = cellText(value).replace(/\s/g, '')
  if (!raw) return null
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(raw)) {
    const [intPart, dec] = raw.replace(/\./g, '').split(',')
    const num = Number(dec ? `${intPart}.${dec}` : intPart)
    return Number.isFinite(num) ? num : null
  }
  const normalized = raw.includes(',') && !raw.includes('.')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/,/g, '')
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function cellIncludedTax(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
    return null
  }
  const raw = cellText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
  if (!raw) return null
  if (raw === '1' || raw === 'true' || raw === 'yes' || raw === 'co') return true
  if (raw === '0' || raw === 'false' || raw === 'no' || raw === 'khong') return false
  const numeric = Number(raw.replace(',', '.'))
  if (numeric === 1) return true
  if (numeric === 0) return false
  return null
}

/** Read mau-chi-tiet-don-hang.xlsx. Does not call the API. */
export async function parseOrderLinesExcel(file: File): Promise<OrderLineExcelParseResult> {
  const buf = await file.arrayBuffer()
  const workbook = XLSX.read(buf, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) {
    return { headerError: 'File không có sheet dữ liệu.', rows: [], issues: [] }
  }

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: true })
  if (!raw.length) {
    return { headerError: 'File không có dòng dữ liệu.', rows: [], issues: [] }
  }

  const headerMap = new Map<string, string>()
  Object.keys(raw[0]).forEach((key) => {
    const normalized = headerKey(key)
    if (normalized && !headerMap.has(normalized)) headerMap.set(normalized, key)
  })

  const required = [
    HEADER_FIELDS.productCode,
    HEADER_FIELDS.vendorCode,
    HEADER_FIELDS.quantity,
    HEADER_FIELDS.unitPrice,
    HEADER_FIELDS.uom,
    HEADER_FIELDS.includedTax,
  ]
  const missing = required.filter((key) => !headerMap.has(key))
  if (missing.length) {
    return {
      headerError: 'File không đúng mẫu mau-chi-tiet-don-hang. Hãy dùng nút Tải mẫu Excel.',
      rows: [],
      issues: [],
    }
  }

  const read = (row: Record<string, unknown>, field: string) => row[headerMap.get(field) as string]
  const rows: ParsedOrderLineExcelRow[] = []
  const issues: OrderLineExcelParseIssue[] = []

  raw.forEach((row, index) => {
    const productCode = cellText(read(row, HEADER_FIELDS.productCode))
    const productName = cellText(read(row, HEADER_FIELDS.productName))
    const vendorCode = cellText(read(row, HEADER_FIELDS.vendorCode))
    const quantity = cellNumber(read(row, HEADER_FIELDS.quantity))
    const unitPrice = cellNumber(read(row, HEADER_FIELDS.unitPrice))
    const uom = cellText(read(row, HEADER_FIELDS.uom))
    const includedTax = cellIncludedTax(read(row, HEADER_FIELDS.includedTax))
    const receiverNote = cellText(read(row, HEADER_FIELDS.receiverNote))
    const deliveryNote = cellText(read(row, HEADER_FIELDS.deliveryNote))
    const referenceNote = cellText(read(row, HEADER_FIELDS.referenceNote))
    const notes = cellText(read(row, HEADER_FIELDS.notes))

    const isEmpty = !productCode && !productName && !vendorCode && quantity === null
      && unitPrice === null && !uom && includedTax === null
      && !receiverNote && !deliveryNote && !referenceNote && !notes
    if (isEmpty) return

    const rowNumber = index + 2
    const messages: string[] = []
    if (!productCode) messages.push('Thiếu Mã hàng')
    if (!vendorCode) messages.push('Thiếu Mã NCC')
    if (quantity === null || quantity <= 0) messages.push('Số lượng phải lớn hơn 0')
    if (unitPrice === null || unitPrice < 0) messages.push('Đơn giá không hợp lệ')
    if (!uom) messages.push('Thiếu ĐVT')
    if (includedTax === null) messages.push('Gồm thuế phải là 1 hoặc 0')

    if (messages.length) {
      issues.push({ rowNumber, messages })
      return
    }

    rows.push({
      rowNumber,
      productCode,
      productName,
      vendorCode,
      quantity: quantity as number,
      unitPrice: unitPrice as number,
      uom,
      isIncludedTax: includedTax as boolean,
      receiverNote,
      deliveryNote,
      referenceNote,
      notes,
    })
  })

  if (!rows.length && !issues.length) {
    return { headerError: 'File không có dòng dữ liệu.', rows: [], issues: [] }
  }

  return { rows, issues }
}
