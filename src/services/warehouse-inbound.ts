import { fetcherWithAuth, METHODS } from '@/lib/api';
import {
  URL_WAREHOUSE_INBOUND_CONFIRM,
  URL_WAREHOUSE_INBOUND_RECEIPT_APPROVE,
  URL_WAREHOUSE_INBOUND_RECEIPT_LINE_BY_ID,
  URL_WAREHOUSE_INBOUND_RECEIPT_LINES,
  URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST,
  URL_WAREHOUSE_INBOUND_PAYMENT_REQUEST_RECEIPTS,
  URL_WAREHOUSE_INBOUND_REJECT,
  URL_WAREHOUSE_INBOUND_RECEIPT_BY_ID,
  URL_WAREHOUSE_INBOUND_LIST,
  URL_WAREHOUSE_INBOUND_SEARCH,
  URL_WAREHOUSE_INBOUND_SUBMIT,
  URL_WAREHOUSE_INBOUND_CANCEL,
  URL_WAREHOUSE_INBOUND_RECEIPT_UPLOAD_FILE,
  URL_WAREHOUSE_INBOUND_RECEIPT_FILES,
} from '@/lib/url';
import type { IPaymentFileObject } from '@/types/payment';
import { IRequestPaginationAndSearch } from '@/types/api';
import { IPaymentRequestInfo } from '@/types/payment';
import type {
  IWarehouseInboundAddLineRequest,
  IWarehouseInboundApproveRequest,
  IWarehouseInboundConfirmRequest,
  IWarehouseInboundLinePatchRequest,
  IWarehouseInboundListResponse,
  IWarehouseInboundRejectRequest,
  IWarehouseInboundReceiptInfo,
  IWarehouseInboundSearchParams,
  IWarehouseInboundSearchResponse,
} from '@/types/warehouse-inbound';

function buildSearchUrl(baseUrl: string, params: IWarehouseInboundSearchParams): string {
  const sp = new URLSearchParams();
  const n = params.notesContains?.trim();
  const t = params.paperType?.trim();
  const c = params.paperCode?.trim();
  if (n) sp.set('notesContains', n);
  if (t) sp.set('paperType', t);
  if (c) sp.set('paperCode', c);
  const q = sp.toString();
  return q ? `${baseUrl}?${q}` : baseUrl;
}

export const searchWarehouseInbound = async (params: IWarehouseInboundSearchParams) => {
  return await fetcherWithAuth<IWarehouseInboundSearchResponse>(
    buildSearchUrl(URL_WAREHOUSE_INBOUND_SEARCH, params),
    { method: METHODS.GET },
  );
};

export const listWarehouseInbound = async (body: IRequestPaginationAndSearch, status?: string) => {
  const url = status ? `${URL_WAREHOUSE_INBOUND_LIST}?status=${status}` : URL_WAREHOUSE_INBOUND_LIST;
  return await fetcherWithAuth<IWarehouseInboundListResponse>(url, {
    method: METHODS.POST,
    data: body,
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

export const addWarehouseInboundReceiptLine = async (receiptId: string, body: IWarehouseInboundAddLineRequest) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_RECEIPT_LINES.replace('{receiptId}', receiptId),
    { method: METHODS.POST, data: body },
  );
};

export const patchWarehouseInboundReceiptLine = async (
  receiptId: string,
  lineId: string,
  body: IWarehouseInboundLinePatchRequest,
) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_RECEIPT_LINE_BY_ID.replace('{receiptId}', receiptId).replace('{lineId}', lineId),
    { method: METHODS.PATCH, data: body },
  );
};

export const deleteWarehouseInboundReceiptLine = async (receiptId: string, lineId: string) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_RECEIPT_LINE_BY_ID.replace('{receiptId}', receiptId).replace('{lineId}', lineId),
    { method: METHODS.DELETE },
  );
};

export const submitWarehouseInboundReceipt = async (receiptId: string) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_SUBMIT.replace('{receiptId}', receiptId),
    { method: METHODS.POST },
  );
};

export const approveWarehouseInboundReceipt = async (receiptId: string, body: IWarehouseInboundApproveRequest) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_RECEIPT_APPROVE.replace('{receiptId}', receiptId),
    { method: METHODS.POST, data: body },
  );
};

export const rejectWarehouseInboundReceipt = async (receiptId: string, body: IWarehouseInboundRejectRequest) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_REJECT.replace('{receiptId}', receiptId),
    { method: METHODS.POST, data: body },
  );
};

export const cancelWarehouseInboundReceipt = async (receiptId: string) => {
  return await fetcherWithAuth<IWarehouseInboundReceiptInfo>(
    URL_WAREHOUSE_INBOUND_CANCEL.replace('{receiptId}', receiptId),
    { method: METHODS.POST },
  );
};

export const uploadWarehouseInboundReceiptFile = async (
  receiptId: string,
  file: File,
  category?: string,
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  return await fetcherWithAuth<IPaymentFileObject>(
    URL_WAREHOUSE_INBOUND_RECEIPT_UPLOAD_FILE.replace('{receiptId}', receiptId),
    { method: METHODS.POST, data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
  );
};

export const listWarehouseInboundReceiptFiles = async (receiptId: string) => {
  return await fetcherWithAuth<IPaymentFileObject[]>(
    URL_WAREHOUSE_INBOUND_RECEIPT_FILES.replace('{receiptId}', receiptId),
    { method: METHODS.GET },
  );
};
