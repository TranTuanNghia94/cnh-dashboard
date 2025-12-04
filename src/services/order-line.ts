import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_CREATE_ORDER_LINE } from "@/lib/url";
import { IOrderLineCreateRequest, IOrderLineResponse } from "@/types/order";

export const createOrderLine = async (
  body: IOrderLineCreateRequest[],
  orderId: string
) => {
  const response = await fetcherWithAuth<IOrderLineResponse>(
    URL_CREATE_ORDER_LINE.replace("{orderId}", orderId),
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};
