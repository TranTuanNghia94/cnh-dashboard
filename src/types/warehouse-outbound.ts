import {
  IPaymentFileObject,
  IPaymentFileUploadInfo,
  IPaymentRequestApprovalInfo,
} from "./payment";

export const WAREHOUSE_OUTBOUND_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type TWarehouseOutboundStatus =
  (typeof WAREHOUSE_OUTBOUND_STATUS)[keyof typeof WAREHOUSE_OUTBOUND_STATUS];

export interface IWarehouseOutboundActionsInfo {
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  canResubmit: boolean;
}

export interface IWarehouseOutboundCreateRequest {
  contractNumber: string;
  outboundReason: string;
  note?: string;
  currency?: string;
  outboundDate?: string;
  approvalLevels?: number;
  approvalRoles?: string[];
  attachedFileIds?: string[];
  details?: IWarehouseOutboundDetailRequest[];
}

export interface IWarehouseOutboundDetailRequest {
  orderLineId: string;
  quantity: number;
  box?: string;
  referenceCode?: string;
  currency?: string;
  note?: string;
}

export interface IWarehouseOutboundRequest {
  productId: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  note: string;
}

export interface IWarehouseOutboundDetailInfo {
  id: string;
  orderLineId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  box: string;
  referenceCode: string;
  unitPrice: number;
  priceWithoutTax: number;
  vat: number;
  currency: string;
  totalAmount: number;
  taxAmount: number;
  note: string;
}

export interface IWarehouseOutboundInfo {
  id: string;
  outboundNumber: string;
  orderId: string;
  orderNumber: string;
  contractNumber: string;
  outboundReason: string;
  note: string;
  currency: string;
  outboundDate: string;
  status: TWarehouseOutboundStatus;
  approvalLevels: number;
  currentApprovalLevel: number;
  totalAmount: number;
  taxAmount: number;
  createdBy: string;
  createdAt: string;
  details: IWarehouseOutboundDetailInfo[];
  attachments: IPaymentFileObject[];
  approvals: IPaymentRequestApprovalInfo[];
}

export interface IWarehouseOutboundOrderLineInfo {
  orderLineId: string;
  productId: string;
  productCode: string;
  productName: string;
  orderQuantity: number;
  availableQuantity: number;
  unitPrice: number;
  includedTax: boolean;
  vat: number;
  currency: string;
  totalAmount: number;
  taxAmount: number;
}

export interface IWarehouseOutboundOrderInfo {
  orderId?: string;
  orderNumber?: string;
  contractNumber?: string;
  orderStatus?: string;
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerTaxCode?: string;
  customerAddressId?: string;
  customerAddress?: string;
  customerContactPerson?: string;
  customerAddressPhone?: string;
  currency?: string;
  status?: string;
  orderDate?: string;
  deliveryDate?: string;
  note?: string;
}

export interface IWarehouseOutboundOrderLinesResponse {
  order?: IWarehouseOutboundOrderInfo;
  orderInfo?: IWarehouseOutboundOrderInfo;
  lines?: IWarehouseOutboundOrderLineInfo[];
  data?: IWarehouseOutboundOrderLineInfo[];
}

export interface IWarehouseOutboundListRequest {
  page: number;
  limit: number;
  search?: string;
}

export interface IWarehouseOutboundListPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IWarehouseOutboundListResponse {
  data: IWarehouseOutboundInfo[];
  pagination: IWarehouseOutboundListPagination;
}

export interface IWarehouseOutboundApproveRequest {
  level?: number;
  note?: string;
}

export interface IWarehouseOutboundRejectRequest {
  level?: number;
  reason: string;
  note?: string;
}

export interface IWarehouseOutboundUploadFileRequest {
  file: File;
  category?: string;
}

export interface IWarehouseOutboundFileListResponse {
  data: IPaymentFileUploadInfo[];
}

export interface IWarehouseOutboundOrderSearchInfo {
  orderId: string;
  orderNumber: string;
  contractNumber: string;
  orderStatus: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  customerTaxCode: string;
  customerAddressId: string;
  customerAddress: string;
  customerContactPerson: string;
  customerAddressPhone: string;
  orderLines: IWarehouseOutboundOrderLineInfo[];
}
