import { IPurchaseOrderLineResponse } from "./purchase";



export interface ICreateOrUpdatePaymentRequest {
	id?: string;
    requestorId: string;
    currency: string;
    exchangeRate: number;
    requestDate: string;
    purpose: string;
    paidPercentage: number;
    notes: string;
    papers: IPaymentFileObject[];
    bankInfo?: IPaymentBankInfoObject;
    approvalLevels: number;
    items: IPaymentRequestItemRequest[];
    fees: IPaymentRequestFeeRequest[];
    /** Sum of line item amounts only (excludes fees). */
    amount?: number;
    feeAmount?: number;
    /** Portion of `amount` to pay per `paidPercentage` (full or partial). */
    requestedAmount?: number;
    /** `requestedAmount` + `feeAmount`. */
    totalAmount?: number;
}

export interface IRejectPaymentRequest {
	level: number;
    reason: string;
    note: string;
}

export interface IApprovePaymentRequest {
	level: number;
    note: string;
}

export interface IMarkPaymentPaidRequest {
    paidAmount: number;
    exchangeRate: number;
    bankNote: IPaymentBankNoteObject;
}

export interface IPaymentBankInfoObject {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    branch: string;
    beneficiaryAddress: string;
    note: string;
}

export interface IPaymentBankNoteObject {
    transactionRef: string;
    note: string;
    attachments: IPaymentFileObject[];
}

export interface IPaymentFileObject {
	fileName: string;
    fileUrl: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
    category: string;
}

export interface IPaymentFileUploadInfo {
    fileName: string;
    fileUrl: string;
    contentType: string;
    size: number;
    category: string;
}

export interface IPaymentRequestApprovalInfo {
    id: string;
    level: number;
    role: string;
    approverId: string;
    status: string;
    approvedAt: string;
    rejectionReason: string;
    note: string;
}

export interface IPaymentRequestFeeInfo {
    id: string;
    feeName: string;
    feeType: string;
    amount: number;
    note: string;
} 

export interface IPaymentRequestFeeRequest {
	feeName: string;
    feeType: string;
    amount: number;
    note: string;
}

export interface IPaymentRequestInfo {
    id: string;
    amount: number;
    requestNumber: string;
    requestDate: string;
    requestorId: string;
    vendorId: string;
    status: string;
    approvalLevels: number;
    currentApprovalLevel: number;
    currency: string;
    exchangeRate: number;
    requestedAmount: number;
    requestedAmountVnd: number;
    feeAmount: number;
    feeAmountVnd: number;
    totalAmount: number;
    totalAmountVnd: number;
    paidAmount: number;
    paidAmountVnd: number;
    purpose: string;
    notes: string;
    papers: IPaymentFileObject[];
    bankInfo?: IPaymentBankInfoObject;
    bankNote: IPaymentBankNoteObject;
    paidBy: string;
    paidAt: string;
    items: IPaymentRequestLineInfo[];
    fees: IPaymentRequestFeeInfo[];
    paidPercentage: number;
    createdBy: string;
    approvals: IPaymentRequestApprovalInfo[];
}

export interface IPaymentRequestItemRequest {
    purchaseOrderLineId: string;
    selectedDocumentTypes: string[];
    requestedAmount: number;
    note: string;
}

export interface IPaymentRequestLineInfo {
    id: string;
    purchaseOrderLineId: string;
    selectedDocuments: string;
    requestedAmount: number;
    paidAmount: number;
    note: string;
    purchaseOrderLine?: IPurchaseOrderLineResponse;
}


export interface IPaymentApprovalHistory {
    id: string;
    approved: boolean;
    approvedAt?: string;
    note?: string;
}

export interface IUploadPaymentRequestFileRequest {
    file: File;
    category: string;
    paymentRequestId: string;
    attachmentType: string;
}