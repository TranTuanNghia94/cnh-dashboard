export type BatchOrderImportMetadataKind = 'BATCH_ORDER_IMPORT'

export interface IBatchOrderImportOrderCreated {
  orderId: string
  orderCode: string
  contractNumber: string
  customerCode: string
  lineCount: number
}

export interface IBatchOrderImportRowRef {
  code: string
  name: string
  rowNum: number
}

export interface IBatchOrderImportSummary {
  totalRows: number
  ordersCreatedCount: number
  newProductsCount: number
  newVendorsCount: number
  warningCount: number
  errorCount: number
  ordersCreated: IBatchOrderImportOrderCreated[]
  newProducts: IBatchOrderImportRowRef[]
  newVendors: IBatchOrderImportRowRef[]
  errors: string[]
  warnings: string[]
}

export interface IBatchOrderImportMetadata {
  kind: BatchOrderImportMetadataKind
  schemaVersion: number
  jobId: string
  summary: IBatchOrderImportSummary
}

export interface IBatchOrderImportJob {
  jobId: string
  resultSummary?: IBatchOrderImportSummary
}
