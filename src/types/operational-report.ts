import { IPaginationModel } from '@/types/api'

export interface OperationalReportQuery {
  month?: number
  year?: number
  fromDate?: string
  toDate?: string
  productName?: string
  productCode?: string
  contractNumber?: string
  userName?: string
  vendor?: string
  customer?: string
  documentNumber?: string
  page?: number
  limit?: number
}

export interface OperationalReportPage<T> {
  fromDate: string | null
  toDate: string | null
  data: T[]
  pagination: IPaginationModel
}

export interface StockLedgerRow {
  productId: string
  categoryName: string
  productCode: string
  productName: string
  unit: string
  beginningQuantity: number
  inboundQuantity: number
  outboundQuantity: number
  endingQuantity: number
  unitPrice: number
}

export interface PaymentInstallment {
  sequence: number
  requestNumber: string
  amount: number
  paidDate: string
  percentage: number
  status: string
}

export interface PaymentLedgerRow {
  company: string
  vendorCode: string
  totalAmount: number
  paymentCount: number
  customerName: string
  currency: string
  paperType: string
  paperNumber: string
  note: string
  installments: PaymentInstallment[]
}

export interface VendorDebtRow {
  vendorCode: string
  vendorName: string
  currency: string
  openingDebt: number
  goodsValue: number
  paidAmount: number
  closingDebt: number
}

export interface SalesDetailReportRow {
  csName: string
  customerCode: string
  contractNumber: string
  contractDate: string
  productCode: string
  productName: string
  unit: string
  salesQuantity: number
  salesUnitPrice: number
  salesAmount: number
  taxRate: string
  suggestedVendorCode: string
  reference: string
  teacher: string
  department: string
  note: string
  confirmedVendorCode: string
  paymentPaperType: string
  paymentPaperNumber: string
  purchaseQuantity: number
  currency: string
  purchaseUnitPrice: number
  purchaseAmount: number
  quoteNumber: string
  invoiceNumber: string
  billNumber: string
  receiptWarehouse: string
  trackingNumber: string
  inboundDate: string
  inboundNumber: string
  inboundQuantity: number
  inboundUnitPrice: number
  inboundAmount: number
  inboundInvoiceNumber: string
  bookBillNumber: string
  inboundNote: string
}

export interface OutboundSummaryReportRow {
  userName: string
  outboundDate: string
  outboundNumber: string
  contractNumber: string
  customerName: string
  amountBeforeTax: number
  vatAmount: number
  totalAmount: number
}

export interface OutboundDetailReportRow {
  postingDate: string
  documentDate: string
  documentNumber: string
  outboundNumber: string
  reason: string
  invoiceNumber: string
  invoiceDate: string
  customerCode: string
  customerName: string
  narrative: string
  productCode: string
  productName: string
  debitAccount: string
  creditAccount: string
  quantity: number
  unitPrice: number
  amount: number
  vatRate: number
  vatAmount: number
  vatAccount: string
  warehouseCode: string
  cogsAccount: string
  inventoryAccount: string
  businessUnit: string
}

export interface InboundSummaryReportRow {
  userName: string
  receivedDate: string
  receiptNumber: string
  contractNumber: string
  vendorName: string
  currency: string
  foreignValue: number
  vatAmount: number
  feeAmount: number
  foreignTotal: number
  vndTotal: number
}

export interface InboundDetailReportRow {
  documentDate: string
  receiptNumber: string
  invoiceNumber: string
  vendorCode: string
  productCode: string
  productName: string
  warehouseCode: string
  inventoryAccount: string
  payableAccount: string
  quantity: number
  unitPrice: number
  currency: string
  exchangeRate: number
  amount: number
  convertedAmount: number
  vatRate: number
  vatAmount: number
  convertedVatAmount: number
  inputVatAccount: string
  vatAccount: string
  billOnPaper: string
  lineNote: string
}
