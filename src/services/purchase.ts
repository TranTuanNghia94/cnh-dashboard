import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_PURCHASE_ORDER,
  URL_FIND_PURCHASE_ORDER_LINE_BY_DOCUMENT,
  URL_GET_ALL_PURCHASE_ORDERS,
  URL_GET_PURCHASE_ORDER_BY_ID,
  URL_UPDATE_PURCHASE_ORDER,
} from "@/lib/url";
import { IPurchaseCreateRequest, IPurchaseOrderResponse, IPurchaseOrderLineResponse, IFindPurchaseOrderLineByDocumentRequest } from "@/types/purchase";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";

export const getAllPurchases = async (body?: IRequestPaginationAndSearch) => {
  const response = await fetcherWithAuth<IResponsePaginationAndSearch<IPurchaseOrderResponse>>(URL_GET_ALL_PURCHASE_ORDERS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const createPurchaseOrder = async (body: IPurchaseCreateRequest) => {
  const response = await fetcherWithAuth<IPurchaseOrderResponse>(URL_CREATE_PURCHASE_ORDER, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const getPurchaseById = async (id: string) => {
  const response = await fetcherWithAuth<IPurchaseOrderResponse>(URL_GET_PURCHASE_ORDER_BY_ID.replace('{id}', id), {
    method: METHODS.GET,
  });
  return response;
};

export const updatePurchaseOrder = async (body: IPurchaseCreateRequest) => {
  const response = await fetcherWithAuth<IPurchaseOrderResponse>(URL_UPDATE_PURCHASE_ORDER, {
    method: METHODS.POST,
    data: body,
  });
  return response;
};


export const findPurchaseOrderLineByDocument = async (body: IFindPurchaseOrderLineByDocumentRequest) => {
  const response = await fetcherWithAuth<IPurchaseOrderLineResponse[]>(URL_FIND_PURCHASE_ORDER_LINE_BY_DOCUMENT, {
    method: METHODS.POST,
    data: body,
  });
  return response;
};