import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_OR_UPDATE_PAYMENT_REQUEST,
  URL_GET_ALL_PAYMENT_REQUESTS,
  URL_GET_PAYMENT_REQUEST_BY_ID,
  URL_UPDATE_PAYMENT_REQUEST,
} from "@/lib/url";
import { ICreateOrUpdatePaymentRequest, IPaymentRequestInfo } from "@/types/payment";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";

export const getAllPayments = async (body?: IRequestPaginationAndSearch) => {
    const response = await fetcherWithAuth<IResponsePaginationAndSearch<IPaymentRequestInfo>>(URL_GET_ALL_PAYMENT_REQUESTS, {
      method: METHODS.POST,
      data: body,
    });
  
    return response;
};

export const createOrUpdatePaymentRequest = async (body: ICreateOrUpdatePaymentRequest) => {
  const response = await fetcherWithAuth<IPaymentRequestInfo>(URL_CREATE_OR_UPDATE_PAYMENT_REQUEST, {
    method: METHODS.POST,
    data: body,
  });
  return response;
};

export const getPaymentRequestById = async (id: string) => {
  const response = await fetcherWithAuth<IPaymentRequestInfo>(
    URL_GET_PAYMENT_REQUEST_BY_ID.replace('{id}', id),
    { method: METHODS.GET },
  );
  return response;
};

export const updatePaymentRequest = async (body: ICreateOrUpdatePaymentRequest) => {
  const response = await fetcherWithAuth<IPaymentRequestInfo>(URL_UPDATE_PAYMENT_REQUEST, {
    method: METHODS.POST,
    data: body,
  });
  return response;
};