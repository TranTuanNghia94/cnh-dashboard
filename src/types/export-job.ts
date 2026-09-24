export type ExportJobType =
  | 'PRODUCTS'
  | 'VENDORS'
  | 'CUSTOMERS'
  | 'WAREHOUSE_INVENTORY'
  | 'REPORT_STOCK'
  | 'REPORT_PAYMENT'
  | 'REPORT_INBOUND'
  | 'REPORT_INBOUND_DETAIL'
  | 'REPORT_OUTBOUND'
  | 'REPORT_OUTBOUND_DETAIL'
  | 'REPORT_VENDOR_DEBT'
  | 'REPORT_SALES_DETAIL'

export type ExportJobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'

export interface ICreateExportJobRequest {
  type: ExportJobType
  fromDate?: string
  toDate?: string
  filters?: Record<string, string>
}

export interface IExportJobResponse {
  id: string
  type: ExportJobType
  status: ExportJobStatus
  fileName: string | null
  totalRows: number | null
  startedAt: string | null
  finishedAt: string | null
  errorMessage: string | null
  createdBy: string | null
  viewUrl: string | null
}

export interface IExportJobNotificationMetadata {
  kind: 'EXPORT_JOB'
  schemaVersion: number
  jobId: string
  type: ExportJobType
  fileName?: string
  totalRows?: number
  downloadUrl?: string
}
