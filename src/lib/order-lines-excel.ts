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
  'Gồm thuế (1/0)',
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
