export interface IWarehouseInventoryBalanceInfo {
  productId: string;
  productCode: string;
  productName: string;
  quantityOnHand: number;
}

export interface IWarehouseStockTransactionInfo {
  id: string;
  productId: string;
  direction: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  note: string;
  createdAt: string;
}

export interface IWarehouseInventoryListPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IWarehouseInventoryListResponse {
  data: IWarehouseInventoryBalanceInfo[];
  pagination: IWarehouseInventoryListPagination;
}

export interface IWarehouseOutboundRequest {
  productId: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  note: string;
}
