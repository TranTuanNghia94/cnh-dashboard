import { fetcherWithAuth, METHODS } from '@/lib/api';
import {
  URL_WAREHOUSE_INBOUND_CONFIRM,
  URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST,
  URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST_RECEIPTS,
  URL_WAREHOUSE_INBOUND_RECEIPT_BY_ID,
  URL_WAREHOUSE_INBOUND_SEARCH,
} from '@/lib/url';
import { IPaymentRequestInfo } from '@/types/payment';
import type {
  IWarehouseInboundConfirmRequest,
  IWarehouseInboundReceiptInfo,
  IWarehouseInboundSearchParams,
  IWarehouseInboundSearchResponse,
} from '@/types/warehouse-inbound';

function buildSearchUrl(params: IWarehouseInboundSearchParams): string {
  const sp = new URLSearchParams();
  const n = params.notesContains?.trim();
  const t = params.paperType?.trim();
  const c = params.paperCode?.trim();
  if (n) sp.set('notesContains', n);
  if (t) sp.set('paperType', t);
  if (c) sp.set('paperCode', c);
  const q = sp.toString();
  return q ? `${URL_WAREHOUSE_INBOUND_SEARCH}?${q}` : URL_WAREHOUSE_INBOUND_SEARCH;
}

export const searchWarehouseInbound = async (params: IWarehouseInboundSearchParams) => {
  return await fetcherWithAuth<IWarehouseInboundSearchResponse>(buildSearchUrl(params), {
    method: METHODS.GET,
  });
};

export const getWarehouseInboundPaymentRequest = async (id: string) => {
  return await fetcherWithAuth<IPaymentRequestInfo>(
    URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST.replace('{id}', id),
    { method: METHODS.GET },
  );
};

export const getWarehouseInboundReceiptsForPaymentRequest = async (paymentRequestId: string) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo[]>(
    URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST_RECEIPTS.replace('{id}', paymentRequestId),
    { method: METHODS.GET },
  );
};

export const getWarehouseInboundReceiptById = async (receiptId: string) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_RECEIPT_BY_ID.replace('{receiptId}', receiptId),
    { method: METHODS.GET },
  );
};

export const confirmWarehouseInbound = async (body: IWarehouseInboundConfirmRequest) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(URL_WAREHOUSE_INBOUND_CONFIRM, {
    method: METHODS.POST,
    data: body,
  });
};
