import { fetcherWithAuth, METHODS } from '@/lib/api';
import {
  URL_WAREHOUSE_OUTBOUND_ACTIONS,
  URL_WAREHOUSE_OUTBOUND_APPROVE,
  URL_WAREHOUSE_OUTBOUND_CANCEL,
  URL_WAREHOUSE_OUTBOUND_CREATE,
  URL_WAREHOUSE_OUTBOUND_DETAIL,
  URL_WAREHOUSE_OUTBOUND_FILES,
  URL_WAREHOUSE_OUTBOUND_LIST,
  URL_WAREHOUSE_OUTBOUND_ORDER_LINES,
  URL_WAREHOUSE_OUTBOUND_REJECT,
  URL_WAREHOUSE_OUTBOUND_RESUBMIT,
  URL_WAREHOUSE_OUTBOUND_SUBMIT,
  URL_WAREHOUSE_OUTBOUND_UPLOAD_FILE,
} from '@/lib/url';
import type { IRequestPaginationAndSearch } from '@/types/api';
import type {
  IWarehouseOutboundActionsInfo,
  IWarehouseOutboundApproveRequest,
  IWarehouseOutboundCreateRequest,
  IWarehouseOutboundFileListResponse,
  IWarehouseOutboundInfo,
  IWarehouseOutboundListResponse,
  IWarehouseOutboundOrderSearchInfo,
  IWarehouseOutboundOrderLinesResponse,
  IWarehouseOutboundOrderLineInfo,
  IWarehouseOutboundRejectRequest,
} from '@/types/warehouse-outbound';

export const getWarehouseOutboundOrderLines = async (contractNumber: string) => {
  const sp = new URLSearchParams();
  if (contractNumber.trim()) sp.set('contractNumber', contractNumber.trim());
  const query = sp.toString();
  const url = query ? `${URL_WAREHOUSE_OUTBOUND_ORDER_LINES}?${query}` : URL_WAREHOUSE_OUTBOUND_ORDER_LINES;
  return await fetcherWithAuth<
    IWarehouseOutboundOrderLineInfo[] | IWarehouseOutboundOrderLinesResponse | IWarehouseOutboundOrderSearchInfo
  >(url, { method: METHODS.GET });
};

export const createWarehouseOutbound = async (body: IWarehouseOutboundCreateRequest) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(URL_WAREHOUSE_OUTBOUND_CREATE, {
    method: METHODS.POST,
    data: body,
  });
};

export const listWarehouseOutbound = async (body: IRequestPaginationAndSearch, status?: string) => {
  const url = status ? `${URL_WAREHOUSE_OUTBOUND_LIST}?status=${status}` : URL_WAREHOUSE_OUTBOUND_LIST;
  return await fetcherWithAuth<IWarehouseOutboundListResponse>(url, {
    method: METHODS.POST,
    data: body,
  });
};

export const getWarehouseOutboundById = async (outboundId: string) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(
    URL_WAREHOUSE_OUTBOUND_DETAIL.replace('{outboundId}', outboundId),
    { method: METHODS.GET },
  );
};

export const getWarehouseOutboundActions = async (outboundId: string) => {
  return await fetcherWithAuth<IWarehouseOutboundActionsInfo>(
    URL_WAREHOUSE_OUTBOUND_ACTIONS.replace('{outboundId}', outboundId),
    { method: METHODS.GET },
  );
};

export const submitWarehouseOutbound = async (outboundId: string) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(
    URL_WAREHOUSE_OUTBOUND_SUBMIT.replace('{outboundId}', outboundId),
    { method: METHODS.POST },
  );
};

export const approveWarehouseOutbound = async (outboundId: string, body: IWarehouseOutboundApproveRequest) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(
    URL_WAREHOUSE_OUTBOUND_APPROVE.replace('{outboundId}', outboundId),
    { method: METHODS.POST, data: body },
  );
};

export const rejectWarehouseOutbound = async (outboundId: string, body: IWarehouseOutboundRejectRequest) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(
    URL_WAREHOUSE_OUTBOUND_REJECT.replace('{outboundId}', outboundId),
    { method: METHODS.POST, data: body },
  );
};

export const cancelWarehouseOutbound = async (outboundId: string) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(
    URL_WAREHOUSE_OUTBOUND_CANCEL.replace('{outboundId}', outboundId),
    { method: METHODS.POST },
  );
};

export const resubmitWarehouseOutbound = async (outboundId: string) => {
  return await fetcherWithAuth<IWarehouseOutboundInfo>(
    URL_WAREHOUSE_OUTBOUND_RESUBMIT.replace('{outboundId}', outboundId),
    { method: METHODS.POST },
  );
};

export const uploadWarehouseOutboundFile = async (outboundId: string, file: File, category?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  return await fetcherWithAuth(
    URL_WAREHOUSE_OUTBOUND_UPLOAD_FILE.replace('{outboundId}', outboundId),
    { method: METHODS.POST, data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
  );
};

export const listWarehouseOutboundFiles = async (outboundId: string) => {
  return await fetcherWithAuth<IWarehouseOutboundFileListResponse>(
    URL_WAREHOUSE_OUTBOUND_FILES.replace('{outboundId}', outboundId),
    { method: METHODS.GET },
  );
};
