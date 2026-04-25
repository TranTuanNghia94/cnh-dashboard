import { IPaymentFileObject, IPaymentRequestApprovalInfo } from "./payment";


export interface IWarehouseInboundAddLineRequest {
    paymentRequestPurchaseOrderLineId: string;
    quantityReceived: number;
    taxPercent?: number;
    lineNote?: string;
}


export interface IWarehouseInboundConfirmLineRequest {
    paymentRequestPurchaseOrderLineId: string;
    quantityReceived: number;
    taxPercent?: number;
    isTaxIncluded?: boolean;
    billOnPaper?: string;
    lineNote?: string;
}

export interface IWarehouseInboundFeeItem {
    feeName: string;
    feeType: string;
    amount: number;
    note?: string;
}

export interface IWarehouseInboundConfirmRequest {
    paymentRequestId: string;
    currency?: string;
    exchangeRate?: number;
    feeAmount?: number;
    fees?: IWarehouseInboundFeeItem[];
    realBillAmount?: number;
    billOnPaperAmount?: number;
    note?: string;
    approvalLevels?: number;
    approvalRoles?: string[];
    lines: IWarehouseInboundConfirmLineRequest[];
    attachedFileIds?: string[];
}

export interface IWarehouseInboundLinePatchRequest {
    quantityReceived: number;
    taxPercent?: number;
    lineNote?: string;
}

export interface IWarehouseInboundApproveRequest {
    level: number;
    note?: string;
}

export interface IWarehouseInboundRejectRequest {
    level: number;
    reason: string;
    note?: string;
}

export interface IWarehouseInboundReceiptInfo {
    id: string;
    paymentRequestId: string;
    status: string;
    approvalLevels: number;
    currentApprovalLevel: number;
    currency: string;
    exchangeRate: number;
    feeAmount: number;
    realBillAmount: number;
    billOnPaperAmount: number;
    note: string;
    inventoryPostedAt: string;
    createdAt: string;
    lines: IWarehouseInboundReceiptLineInfo[];
    attachments: IPaymentFileObject[];
    approvals: IPaymentRequestApprovalInfo[];
}


export interface IWarehouseInboundReceiptLineInfo {
    id: string;
    productId: string;
    productName: string;
    paymentRequestPurchaseOrderLineId: string;
    quantityExpected: number;
    quantityReceived: number;
    taxPercent: number;
    lineNote: string;
}


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

/** Query params for GET /warehouse-inbound/search */
export interface IWarehouseInboundSearchParams {
    notesContains?: string;
    paperType?: string;
    paperCode?: string;
}

export interface IWarehouseInventoryBalanceInfo {
    productId: string;
    productCode: string;
    productName: string;
    quantityOnHand: number;
}

export interface IWarehouseOutboundRequest {
    productId: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    note: string;
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