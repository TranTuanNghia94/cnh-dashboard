import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_ORDER_LINE,
  URL_DELETE_ORDER_LINE,
  URL_UPDATE_ORDER_LINE,
} from "@/lib/url";
import {
  IOrderLineCreateRequest,
  IOrderLineResponse,
  IOrderUpdateRequest,
} from "@/types/order";

export const createOrderLine = async (
  body: IOrderLineCreateRequest[],
  orderId: string,
) => {
  const response = await fetcherWithAuth<IOrderLineResponse>(
    URL_CREATE_ORDER_LINE.replace("{orderId}", orderId),
    {
      method: METHODS.POST,
      data: body,
    },
  );

  return response;
};

export const updateOrderLine = async (
  body: IOrderUpdateRequest[],
  orderId: string,
) => {
  const response = await fetcherWithAuth<IOrderLineResponse>(
    URL_UPDATE_ORDER_LINE.replace("{orderId}", orderId),
    {
      method: METHODS.POST,
      data: body,
    },
  );

  return response;
};

export const deleteOrderLine = async (orderId: string, ids: string[]) => {
  const response = await fetcherWithAuth<IOrderLineResponse>(
    URL_DELETE_ORDER_LINE.replace("{orderId}", orderId),
    {
      method: METHODS.DELETE,
      data: { ids },
    },
  );

  return response;
};
