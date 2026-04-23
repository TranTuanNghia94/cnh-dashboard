import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_OR_UPDATE_PAYMENT_REQUEST,
  URL_GET_ALL_PAYMENT_REQUESTS,
  URL_GET_PAYMENT_REQUEST_BY_ID,
  URL_PAYMENT_REQUEST_APPROVE,
  URL_PAYMENT_REQUEST_FILES,
  URL_PAYMENT_REQUEST_REJECT,
  URL_PAYMENT_REQUEST_SEND_TO_ACCOUNTANT,
  URL_PAYMENT_REQUEST_UPLOAD_FILE,
  URL_UPDATE_PAYMENT_REQUEST,
} from "@/lib/url";
import { IApprovePaymentRequest, ICreateOrUpdatePaymentRequest, IPaymentFileObject, IPaymentRequestInfo, IRejectPaymentRequest, IUploadPaymentRequestFileRequest } from "@/types/payment";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch, IUploadFileResponse } from "@/types/api";

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

export const uploadPaymentRequestFile = async (body: IUploadPaymentRequestFileRequest) => {
  const formData = new FormData()
  formData.append('file', body.file)
  formData.append('category', body.category || '')
  formData.append('paymentRequestId', body.paymentRequestId || '')
  formData.append('attachmentType', body.attachmentType || '')
  const response = await fetcherWithAuth<IUploadFileResponse>(URL_PAYMENT_REQUEST_UPLOAD_FILE, {
    method: METHODS.POST,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const getPaymentRequestFiles = async (id: string) => {
  const response = await fetcherWithAuth<IPaymentFileObject[]>(URL_PAYMENT_REQUEST_FILES.replace('{id}', id), { method: METHODS.GET });
  return response;
};


export const sendPaymentRequestToAccountant = async (id: string) => {
  const response = await fetcherWithAuth<void>(URL_PAYMENT_REQUEST_SEND_TO_ACCOUNTANT.replace('{id}', id), { method: METHODS.POST });
  return response;
};

export const approvePaymentRequest = async (id: string, body: IApprovePaymentRequest) => {
  const response = await fetcherWithAuth<IPaymentRequestInfo>(URL_PAYMENT_REQUEST_APPROVE.replace('{id}', id), {
    method: METHODS.POST,
    data: body,
  });
  return response;
};

export const rejectPaymentRequest = async (id: string, body: IRejectPaymentRequest) => {
  const response = await fetcherWithAuth<IPaymentRequestInfo>(URL_PAYMENT_REQUEST_REJECT.replace('{id}', id), {
    method: METHODS.POST,
    data: body,
  });
  return response;
};