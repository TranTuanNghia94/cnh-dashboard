import { IOrderResponse } from "./order";
import { IProductResponse } from "./product";
import { IVendorResponse } from "./vendor";


export interface IPurchaseCreateRequest {
    id?: string;
    orderId: string;
    orderDate: string;
    expectedDeliveryDate: string;
    status: string;
    notes: string;
    purchaseOrderLines: IPurchaseOrderLineCreateRequest[];
}


export interface IPurchaseOrderLineCreateRequest {
    id?: string;
    purchaseOrderId: string;
    saleOrderLineId: string;
    productId: string;
    vendorId: string;
    link: string;
    quantity: number;
    uom1: string;
    uom2: string;
    unitPrice: number;
    isTaxIncluded: boolean;
    tax: number;
    totalBeforeTax: number;
    totalPrice: number;
    currency: string;
    exchangeRate: number;
    totalPriceVnd: number;
    note: string;
    quote: string;
    invoice: string;
    billOfLadding: string;
    receiptWarehouse: string;
    trackId: string;
    purchaseContractNumber: string;
    isDeleted?: boolean;
}


export interface IPurchaseOrderResponse {
    id: string;
    poNumber: number;
    poPrefix: string;
    order: IOrderResponse;
    orderDate: string;
    expectedDeliveryDate: string;
    status: string;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    currency: string;
    exchangeRate: number;
    totalAmountVnd: number;
    notes: string;
    processPercentage: number;
    purchaseOrderLines: IPurchaseOrderLineResponse[];
    createdBy: string;
    updatedBy: string;
}

export interface IPurchaseOrderLineResponse {
    id: string;
    purchaseOrderId: string;
    saleOrderLineId: string;
    productId: string;
    productName: string;
    vendorId: string;
    vendorName: string;
    product: IProductResponse;
    vendor: IVendorResponse;
    link: string;
    quantity: number;
    uom1: string;
    uom2: string;
    unitPrice: number;
    isTaxIncluded: boolean;
    tax: number;
    totalBeforeTax: number;
    totalPrice: number;
    currency: string;
    exchangeRate: number;
    totalPriceVnd: number;
    note: string;
    quote: string;
    invoice: string;
    billOfLadding: string;
    receiptWarehouse: string;
    trackId: string;
    purchaseContractNumber: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
}