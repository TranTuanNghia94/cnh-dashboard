import { ColumnDef } from '@tanstack/react-table'

import { PAYMENT_REQUEST_STATUS_STYLES } from '@/lib/constants'
import {
  InboundDetailReportRow,
  InboundSummaryReportRow,
  OutboundDetailReportRow,
  OutboundSummaryReportRow,
  PaymentInstallment,
  PaymentLedgerRow,
  SalesDetailReportRow,
  StockLedgerRow,
  VendorDebtRow,
} from '@/types/operational-report'

const quantityFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 })

function textColumn<T>(key: keyof T & string, header: string, numeric = false): ColumnDef<T> {
  return {
    accessorKey: key,
    header,
    meta: { numeric },
    cell: ({ getValue }) => {
      const value = getValue()
      if (value == null || value === '') return <span className="text-muted-foreground">—</span>
      if (numeric) {
        const amount = Number(value)
        if (!Number.isFinite(amount)) return String(value)
        const emphasized = key === 'endingQuantity' || key === 'closingDebt' || key === 'totalAmount'
        return (
          <span className={amount < 0 ? 'font-medium text-destructive' : emphasized ? 'font-medium' : undefined}>
            {quantityFormat.format(amount)}
          </span>
        )
      }
      return String(value)
    },
  }
}

function columnsOf<T>(defs: Array<[keyof T & string, string, boolean?]>): ColumnDef<T>[] {
  return [
    {
      id: 'stt',
      header: 'STT',
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination
        return pageIndex * pageSize + row.index + 1
      },
    },
    ...defs.map(([key, header, numeric]) => textColumn<T>(key, header, numeric)),
  ]
}

export const stockColumns: ColumnDef<StockLedgerRow>[] = [
  ...columnsOf<StockLedgerRow>([
    ['categoryName', 'Nhóm hàng'],
    ['productCode', 'Mã hàng'],
    ['productName', 'Tên hàng'],
    ['unit', 'Đơn vị'],
    ['beginningQuantity', 'Tồn đầu kỳ', true],
    ['inboundQuantity', 'Nhập kho', true],
    ['outboundQuantity', 'Xuất kho', true],
    ['endingQuantity', 'Tồn cuối kỳ', true],
    ['unitPrice', 'Đơn giá', true],
  ]),
  {
    id: 'detail',
    header: 'Chi tiết',
    cell: ({ row, table }) => (
      <button
        type="button"
        className="inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        onClick={() => {
          const openDetail = (table.options.meta as { openStockDetail?: (product: StockLedgerRow) => void } | undefined)
            ?.openStockDetail
          openDetail?.(row.original)
        }}
      >
        Chi tiết
      </button>
    ),
  },
]

export const outboundSummaryColumns = columnsOf<OutboundSummaryReportRow>([
  ['userName', 'User'],
  ['outboundDate', 'Ngày thực hiện'],
  ['outboundNumber', 'Số phiếu'],
  ['contractNumber', 'Số hợp đồng'],
  ['customerName', 'Khách hàng'],
  ['amountBeforeTax', 'Thành tiền', true],
  ['vatAmount', 'Tiền VAT', true],
  ['totalAmount', 'Tổng tiền', true],
])

export const outboundDetailColumns = columnsOf<OutboundDetailReportRow>([
  ['postingDate', 'Ngày hạch toán'],
  ['documentNumber', 'Số chứng từ'],
  ['outboundNumber', 'Số phiếu xuất'],
  ['reason', 'Lý do xuất'],
  ['customerCode', 'Mã khách hàng'],
  ['customerName', 'Tên khách hàng'],
  ['productCode', 'Mã hàng'],
  ['productName', 'Tên hàng'],
  ['debitAccount', 'TK nợ'],
  ['creditAccount', 'TK doanh thu'],
  ['quantity', 'Số lượng', true],
  ['unitPrice', 'Đơn giá', true],
  ['amount', 'Thành tiền', true],
  ['vatRate', '% thuế GTGT', true],
  ['vatAmount', 'Tiền thuế GTGT', true],
  ['vatAccount', 'TK thuế'],
  ['warehouseCode', 'Kho'],
  ['cogsAccount', 'TK giá vốn'],
  ['inventoryAccount', 'TK kho'],
  ['businessUnit', 'Đơn vị'],
])

export const inboundSummaryColumns = columnsOf<InboundSummaryReportRow>([
  ['userName', 'User'],
  ['receivedDate', 'Ngày thực hiện'],
  ['receiptNumber', 'Số phiếu'],
  ['contractNumber', 'Số hợp đồng'],
  ['vendorName', 'Vendor'],
  ['currency', 'Loại tiền'],
  ['foreignValue', 'Giá trị (ngoại tệ)', true],
  ['vatAmount', 'VAT', true],
  ['feeAmount', 'Phí', true],
  ['foreignTotal', 'Tổng tiền (ngoại tệ)', true],
  ['vndTotal', 'Tổng tiền (VND)', true],
])

export const inboundDetailColumns = columnsOf<InboundDetailReportRow>([
  ['documentDate', 'Ngày chứng từ'],
  ['receiptNumber', 'Số phiếu nhập'],
  ['invoiceNumber', 'Số hóa đơn'],
  ['vendorCode', 'Mã nhà cung cấp'],
  ['productCode', 'Mã hàng'],
  ['productName', 'Tên hàng'],
  ['warehouseCode', 'Kho'],
  ['inventoryAccount', 'TK kho'],
  ['payableAccount', 'TK công nợ'],
  ['quantity', 'Số lượng', true],
  ['unitPrice', 'Đơn giá', true],
  ['currency', 'Loại tiền'],
  ['exchangeRate', 'Tỷ giá', true],
  ['amount', 'Thành tiền', true],
  ['convertedAmount', 'Thành tiền quy đổi', true],
  ['vatRate', '% thuế GTGT', true],
  ['vatAmount', 'Tiền thuế GTGT', true],
  ['convertedVatAmount', 'Tiền thuế quy đổi', true],
  ['inputVatAccount', 'TKĐƯ thuế'],
  ['vatAccount', 'TK thuế'],
  ['billOnPaper', 'Bill thực tế'],
  ['lineNote', 'Bill sổ sách'],
])

const percentFormat = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function PaymentInstallmentsCell({ installments }: { installments?: PaymentInstallment[] }) {
  if (!installments?.length) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex min-w-[280px] flex-col gap-1.5 py-1">
      {installments.map((item) => {
        const status = PAYMENT_REQUEST_STATUS_STYLES[item.status]
        return (
          <div
            key={`${item.sequence}-${item.requestNumber}`}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border bg-muted/40 px-2 py-1.5 text-xs"
          >
            <span className="font-semibold">Lần {item.sequence}</span>
            <span className="text-muted-foreground">{item.requestNumber}</span>
            <span className="tabular-nums">{quantityFormat.format(Number(item.amount ?? 0))}</span>
            <span className="text-muted-foreground">{item.paidDate || '—'}</span>
            <span className="tabular-nums">{percentFormat.format(Number(item.percentage ?? 0))}%</span>
            <span className={status?.style ?? 'rounded-md bg-muted px-2 py-0.5 text-muted-foreground'}>
              {status?.label ?? item.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const paymentColumns: ColumnDef<PaymentLedgerRow>[] = [
  ...columnsOf<PaymentLedgerRow>([
    ['vendorCode', 'Nhà cung cấp'],
    ['customerName', 'Khách hàng'],
    ['currency', 'Tiền tệ'],
    ['paperType', 'Loại chứng từ'],
    ['paperNumber', 'Số chứng từ'],
    ['paymentCount', 'Số lần', true],
    ['totalAmount', 'Tổng tiền', true],
  ]),
  {
    id: 'installments',
    header: 'Các lần thanh toán',
    meta: { wrap: true },
    cell: ({ row }) => <PaymentInstallmentsCell installments={row.original.installments} />,
  },
]

export const vendorDebtColumns = columnsOf<VendorDebtRow>([
  ['vendorCode', 'Mã NCC'],
  ['vendorName', 'Tên NCC'],
  ['currency', 'Ngoại tệ'],
  ['openingDebt', 'Dư nợ đầu kỳ', true],
  ['goodsValue', 'Giá trị hàng nhập', true],
  ['paidAmount', 'Đã thanh toán', true],
  ['closingDebt', 'Dư nợ cuối kỳ', true],
])

export const salesDetailColumns = columnsOf<SalesDetailReportRow>([
  ['csName', 'CS'],
  ['customerCode', 'Mã KH'],
  ['contractNumber', 'Số HĐ'],
  ['contractDate', 'Ngày HĐ'],
  ['productCode', 'Mã hàng'],
  ['productName', 'Tên hàng'],
  ['unit', 'ĐVT'],
  ['salesQuantity', 'SL', true],
  ['salesUnitPrice', 'Đơn giá', true],
  ['salesAmount', 'Thành tiền', true],
  ['taxRate', 'Thuế suất'],
  ['suggestedVendorCode', 'Vendor tham khảo'],
  ['reference', 'Ref'],
  ['teacher', 'Giáo viên'],
  ['department', 'Phòng ban'],
  ['note', 'Ghi chú'],
  ['confirmedVendorCode', 'Vendor CF'],
  ['paymentPaperType', 'Loại chứng từ thanh toán'],
  ['paymentPaperNumber', 'Số chứng từ thanh toán'],
  ['purchaseQuantity', 'Số lượng', true],
  ['currency', 'Ngoại tệ'],
  ['purchaseUnitPrice', 'Đơn giá mua', true],
  ['purchaseAmount', 'Thành tiền mua', true],
  ['quoteNumber', 'Số Quote'],
  ['invoiceNumber', 'Số invoice'],
  ['billNumber', 'Số bill'],
  ['receiptWarehouse', 'Receipt warehouse'],
  ['trackingNumber', 'Tracking number'],
  ['inboundDate', 'Ngày nhập kho'],
  ['inboundNumber', 'Số phiếu nhập'],
  ['inboundQuantity', 'Số lượng nhập', true],
  ['inboundUnitPrice', 'Đơn giá nhập', true],
  ['inboundAmount', 'Thành tiền nhập', true],
  ['inboundInvoiceNumber', 'Số invoice nhập'],
  ['bookBillNumber', 'Số bill sổ sách'],
  ['inboundNote', 'Ghi chú nhập'],
])
