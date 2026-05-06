

export interface IDeliverySlipLineInfo {
    outboundDetailId: string;
    orderLineId: string;
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    box: string;
    referenceCode: string;
    unitPrice: number;
    vat: number;
    currency: string;
    totalAmount: number;
    taxAmount: number;
    receiverNote: string;
    deliveryNote: string;
    note?: string;
}

export interface IDeliverySlipInfo {
    outboundId: string;
    outboundNumber: string;
    outboundDate: string;
    outboundReason: string;
    outboundStatus: string;
    contractNumber: string;
    note: string;
    createdAt: string;
    createdBy: string;

    orderId: string;
    orderNumber: string;
    orderDate: string;
    deliveryDate: string;
    orderStatus: string;

    customerId: string;
    customerCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerTaxCode: string;

    customerAddressId: string;
    customerAddress: string;
    customerContactPerson: string;
    customerAddressPhone: string;
    customerAddressEmail: string;

    currency: string;
    totalAmount: number;
    taxAmount: number;
    lines: IDeliverySlipLineInfo[];
}