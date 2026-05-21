export type ExportJobType = 'PRODUCTS' | 'VENDORS' | 'CUSTOMERS' | 'WAREHOUSE_INVENTORY'

export type ExportJobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'

export interface ICreateExportJobRequest {
  type: ExportJobType
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
