import {
  URL_REPORT_INBOUND,
  URL_REPORT_INBOUND_DETAIL,
  URL_REPORT_OUTBOUND,
  URL_REPORT_OUTBOUND_DETAIL,
  URL_REPORT_PAYMENT,
  URL_REPORT_SALES_DETAIL,
  URL_REPORT_STOCK,
  URL_REPORT_VENDOR_DEBT,
} from '@/lib/url'
import type { ExportJobType } from '@/types/export-job'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardList,
  FileSpreadsheet,
  Receipt,
  Scale,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

export type ReportFilter = 'month' | 'range' | 'none'

export type ReportSearchKey =
  | 'productName'
  | 'productCode'
  | 'contractNumber'
  | 'userName'
  | 'vendor'
  | 'customer'
  | 'documentNumber'

export type ReportSearchField = {
  key: ReportSearchKey
  label: string
}

export type ReportCatalogItem = {
  to: '/report/stock' | '/report/outbound' | '/report/outbound-detail' | '/report/inbound' | '/report/inbound-detail' | '/report/payment' | '/report/vendor-debt' | '/report/sales-detail'
  path: string
  title: string
  description: string
  icon: LucideIcon
  filter: ReportFilter
  exportType: ExportJobType
  search: ReportSearchField[]
}

export const REPORT_GROUPS: Array<{ label: string; items: ReportCatalogItem[] }> = [
  {
    label: 'Kho hàng',
    items: [
      {
        to: '/report/stock',
        path: URL_REPORT_STOCK,
        title: 'Xuất nhập tồn',
        description: 'Tồn đầu kỳ, nhập, xuất và tồn cuối theo từng hàng hóa trong tháng.',
        icon: Boxes,
        filter: 'month',
        exportType: 'REPORT_STOCK',
        search: [
          { key: 'productName', label: 'Tên hàng' },
          { key: 'productCode', label: 'Mã hàng' },
        ],
      },
      {
        to: '/report/inbound',
        path: URL_REPORT_INBOUND,
        title: 'Báo cáo nhập kho',
        description: 'Biên nhận nhập đã duyệt trong khoảng ngày đã chọn.',
        icon: ArrowDownToLine,
        filter: 'range',
        exportType: 'REPORT_INBOUND',
        search: [
          { key: 'userName', label: 'Người lập' },
          { key: 'contractNumber', label: 'Số hợp đồng' },
          { key: 'vendor', label: 'Nhà cung cấp' },
          { key: 'documentNumber', label: 'Số phiếu' },
        ],
      },
      {
        to: '/report/inbound-detail',
        path: URL_REPORT_INBOUND_DETAIL,
        title: 'Chi tiết nhập kho',
        description: 'Từng dòng nhập trong khoảng ngày đã chọn, kèm kho và tài khoản kế toán.',
        icon: Warehouse,
        filter: 'range',
        exportType: 'REPORT_INBOUND_DETAIL',
        search: [
          { key: 'productName', label: 'Tên hàng' },
          { key: 'vendor', label: 'Nhà cung cấp' },
          { key: 'documentNumber', label: 'Số phiếu' },
          { key: 'contractNumber', label: 'Số hợp đồng' },
        ],
      },
      {
        to: '/report/outbound',
        path: URL_REPORT_OUTBOUND,
        title: 'Báo cáo xuất kho',
        description: 'Phiếu xuất đã duyệt trong khoảng ngày đã chọn.',
        icon: ArrowUpFromLine,
        filter: 'range',
        exportType: 'REPORT_OUTBOUND',
        search: [
          { key: 'userName', label: 'Người lập' },
          { key: 'contractNumber', label: 'Số hợp đồng' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'documentNumber', label: 'Số phiếu' },
        ],
      },
      {
        to: '/report/outbound-detail',
        path: URL_REPORT_OUTBOUND_DETAIL,
        title: 'Chi tiết xuất kho',
        description: 'Từng dòng xuất trong khoảng ngày đã chọn, kèm khách hàng và tài khoản kế toán.',
        icon: FileSpreadsheet,
        filter: 'range',
        exportType: 'REPORT_OUTBOUND_DETAIL',
        search: [
          { key: 'productName', label: 'Tên hàng' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'documentNumber', label: 'Số phiếu' },
          { key: 'contractNumber', label: 'Số hợp đồng' },
          { key: 'userName', label: 'Người lập' },
        ],
      },
    ],
  },
  {
    label: 'Công nợ và bán hàng',
    items: [
      {
        to: '/report/payment',
        path: URL_REPORT_PAYMENT,
        title: 'Báo cáo thanh toán',
        description: 'Gom đề nghị thanh toán cùng chứng từ thành lần 1, 2 và 3 trong tháng.',
        icon: Receipt,
        filter: 'month',
        exportType: 'REPORT_PAYMENT',
        search: [
          { key: 'vendor', label: 'Nhà cung cấp' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'documentNumber', label: 'Số chứng từ' },
        ],
      },
      {
        to: '/report/vendor-debt',
        path: URL_REPORT_VENDOR_DEBT,
        title: 'Báo cáo tổng hợp',
        description: 'Dư nợ nhà cung cấp trên toàn bộ hàng nhập và số đã thanh toán.',
        icon: Scale,
        filter: 'none',
        exportType: 'REPORT_VENDOR_DEBT',
        search: [{ key: 'vendor', label: 'Nhà cung cấp' }],
      },
      {
        to: '/report/sales-detail',
        path: URL_REPORT_SALES_DETAIL,
        title: 'Báo cáo chi tiết',
        description: 'Toàn bộ dòng mua hàng gắn với đề nghị thanh toán và phiếu nhập.',
        icon: ClipboardList,
        filter: 'none',
        exportType: 'REPORT_SALES_DETAIL',
        search: [
          { key: 'userName', label: 'CS' },
          { key: 'contractNumber', label: 'Số hợp đồng' },
          { key: 'productName', label: 'Tên hàng' },
          { key: 'customer', label: 'Khách hàng' },
        ],
      },
    ],
  },
]

export function findReport(path: string) {
  for (const group of REPORT_GROUPS) {
    const item = group.items.find((report) => report.path === path)
    if (item) return item
  }
  return undefined
}
