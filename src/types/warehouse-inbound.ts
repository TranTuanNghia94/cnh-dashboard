import { IPaymentFileObject, IPaymentRequestApprovalInfo } from "./payment";

// ── Request types ─────────────────────────────────────────────────────────────

export interface IWarehouseInboundSearchParams {
  notesContains?: string;
  paperType?: string;
  paperCode?: string;
}

export interface IWarehouseInboundFeeRequest {
  feeName: string;
  feeType: string;
  amount: number;
  note?: string;
}

export interface IWarehouseInboundConfirmLineRequest {
  paymentRequestPurchaseOrderLineId?: string;
  purchaseOrderLineId?: string;
  quantityReceived: number;
  taxPercent?: number;
  lineNote?: string;
}

export interface IWarehouseInboundConfirmRequest {
  paymentRequestId?: string;
  purchaseOrderId?: string;
  exchangeRate?: number;
  feeAmount?: number;
  fees?: IWarehouseInboundFeeRequest[];
  realBillAmount?: number;
  billOnPaperAmount?: number;
  note?: string;
  receivedDate?: string;
  approvalLevels?: number;
  approvalRoles?: string[];
  lines: IWarehouseInboundConfirmLineRequest[];
  attachedFileIds?: string[];
}

export interface IWarehouseInboundAddLineRequest {
  paymentRequestPurchaseOrderLineId?: string;
  purchaseOrderLineId?: string;
  quantityReceived: number;
  taxPercent?: number;
  lineNote?: string;
}

export interface IWarehouseInboundLinePatchRequest {
  quantityReceived?: number;
  taxPercent?: number;
  lineNote?: string;
}

export interface IWarehouseInboundApproveRequest {
  level?: number;
  note?: string;
}

export interface IWarehouseInboundRejectRequest {
  level?: number;
  reason: string;
  note?: string;
}

// ── Response types ────────────────────────────────────────────────────────────

export interface IWarehouseInboundSearchHit {
  paymentRequestId: string;
  requestNumber: string;
  status: string;
  notes: string;
  vendorCode: string;
  vendorName: string;
}

export interface IWarehouseInboundSearchResponse {
  hits: IWarehouseInboundSearchHit[];
}

export interface IWarehouseInboundFeeInfo {
  id: string;
  feeName: string;
  feeType: string;
  amount: number;
  note?: string;
}

export interface IWarehouseInboundReceiptLineInfo {
  id: string;
  productId: string;
  productName: string;
  paymentRequestPurchaseOrderLineId: string | null;
  purchaseOrderLineId: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  orderContractNumber: string;
  orderLineId: string;
  quantityExpected: number;
  quantityReceived: number;
  taxPercent: number;
  lineNote: string;
}

export interface IWarehouseInboundPurchaseOrderInfo {
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  vendorId: string;
  vendorName: string;
  orderId: string;
  orderNumber: string;
  orderContractNumber: string;
}

export interface IWarehouseInboundOrderInfo {
  orderId: string;
  orderNumber: string;
  contractNumber: string;
  customerName: string;
  status: string;
}

export interface IWarehouseInboundReceiptInfo {
  id: string;
  receiptNumber: string;
  paymentRequestId: string | null;
  status: string;
  approvalLevels: number;
  currentApprovalLevel: number;
  currency: string;
  exchangeRate: number;
  feeAmount: number;
  fees: IWarehouseInboundFeeInfo[];
  realBillAmount: number;
  billOnPaperAmount: number;
  note: string;
  receivedDate: string;
  inventoryPostedAt: string | null;
  createdBy: string;
  createdAt: string;
  lines: IWarehouseInboundReceiptLineInfo[];
  purchaseOrders: IWarehouseInboundPurchaseOrderInfo[];
  orders: IWarehouseInboundOrderInfo[];
  attachments: IPaymentFileObject[];
  approvals: IPaymentRequestApprovalInfo[];
}

// ── List / pagination ─────────────────────────────────────────────────────────

export interface IWarehouseInboundListPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IWarehouseInboundListResponse {
  data: IWarehouseInboundReceiptInfo[];
  pagination: IWarehouseInboundListPagination;
}
