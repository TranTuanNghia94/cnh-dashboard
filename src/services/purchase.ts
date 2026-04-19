import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_CREATE_PURCHASE_ORDER, URL_GET_ALL_PURCHASE_ORDERS } from "@/lib/url";
import { IPurchaseCreateRequest, IPurchaseOrderResponse } from "@/types/purchase";
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
