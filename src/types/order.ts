import { IAddressResponse } from "./address";
import { ICustomerResponse } from "./customer";
import { IProductResponse } from "./product";
import { IVendorResponse } from "./vendor";

export interface IOrderCreateRequest {
    id?: string;
    customerId: string;
    customerAddressId: string;
    contractNumber: string;
    orderDate: string;
    deliveryDate: string;
    status: string;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
    notes: string;
    orderLines?: IOrderLineCreateRequest[];
}

export interface IOrderUpdateRequest {
    id?: string;
    orderId?: string;
    productId?: string;
    vendorId?: string;
    product?: IProductResponse;
    vendor?: IVendorResponse;
    productCodeSuggest: string;
    productNameSuggest: string;
    vendorCodeSuggest: string;
    vendorNameSuggest: string;
    quantity: number;
    unitPrice: number;
    uom: string;
    discountPercent?: number;
    discountAmount?: number;
    isIncludedTax: boolean;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    notes: string;
    isDeleted?: boolean;
    receiverNote?: string;
    deliveryNote?: string;
    referenceNote?: string;
}

export interface IOrderLineCreateRequest {
  id?: string;
  orderId?: string;
  productId?: string;
  vendorId?: string;
  product?: IProductResponse;
  vendor?: IVendorResponse;
  productCodeSuggest: string;
  productNameSuggest: string;
  vendorCodeSuggest: string;
  vendorNameSuggest: string;
  quantity: number;
  unitPrice: number;
  uom: string;
  discountPercent?: number;
  discountAmount?: number;
  isIncludedTax: boolean;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  isDeleted?: boolean;
  receiverNote?: string;
  deliveryNote?: string;
  referenceNote?: string;
}

export interface IOrderLineResponse {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    vendorId: string;
    vendorName: string;
    productCodeSuggest: string;
    productNameSuggest: string;
    vendorCodeSuggest: string;
    vendorNameSuggest: string;
    quantity: number;
    unitPrice: number;
    uom: string;
    discountPercent: number;
    discountAmount: number;
    isIncludedTax: boolean;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    notes: string;
    receiverNote: string;
    deliveryNote: string;
    referenceNote: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface IOrderResponse { 
    id: string;
    orderNumber: number;
    orderPrefix: string;
    customer: ICustomerResponse;
    customerAddress: IAddressResponse;
    contractNumber: string;
    orderDate: Date;
    deliveryDate: Date;
    status: string;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
    orderLines: IOrderLineResponse[];
}