import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_GET_ALL_PO } from "@/lib/url";
import { IPurchaseRequest, IPurchaseResponse } from "@/types/purchase";

export const getAllPurchases = async (body?: IPurchaseRequest) => {
  const response = await fetcherWithAuth<IPurchaseResponse>(URL_GET_ALL_PO, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};
