export type TProductTaxHistorySourceType = 'WAREHOUSE_INBOUND_RECEIPT_LINE' | (string & {})

export interface IProductTaxHistoryItem {
  id: string
  productId: string
  oldTax: string
  newTax: string
  sourceType: TProductTaxHistorySourceType
  sourceId?: string | null
  note?: string | null
  createdAt: string
  createdBy: string
}

export interface IProductTaxHistoryRequest {
  productId: string
  page?: number
  limit?: number
}
