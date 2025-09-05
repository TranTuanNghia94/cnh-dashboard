import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_GET_PAYMENT_REQUEST } from "@/lib/url";
import { IPaymentRequest, IPaymentResponse } from "@/types/payment";

export const getAllPayments = async (body?: IPaymentRequest) => {
    const response = await fetcherWithAuth<IPaymentResponse>(URL_GET_PAYMENT_REQUEST, {
      method: METHODS.POST,
      data: body,
    });
  
    return response;
  };