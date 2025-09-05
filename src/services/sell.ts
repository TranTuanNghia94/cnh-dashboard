import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_MANY_ORDERS,
  URL_CREATE_ORDER,
  URL_DELETE_ORDER,
  URL_DELETE_ORDER_LINE,
  URL_GET_ORDER_LINES,
  URL_GET_ORDERS,
  URL_ORDER_INDEX,
  URL_UPDATE_ORDER,
  URL_UPDATE_ORDER_LINE,
} from "@/lib/url";
import {
  ISellDetailRequest,
  ISellDetailResponse,
  ISellInput,
  ISellRequest,
  ISellResponse,
} from "@/types/sell";

export const getAllSells = async (body?: ISellRequest) => {
  const response = await fetcherWithAuth<ISellResponse>(URL_GET_ORDERS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const createSell = async (body?: ISellRequest) => {
  const response = await fetcherWithAuth<ISellResponse>(URL_CREATE_ORDER, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const updateSell = async (body?: ISellRequest) => {
  const response = await fetcherWithAuth<ISellResponse>(URL_UPDATE_ORDER, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const deleteSell = async (body?: ISellRequest) => {
  const response = await fetcherWithAuth<ISellResponse>(URL_DELETE_ORDER, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const updateSellDetail = async (body?: ISellRequest) => {
  const response = await fetcherWithAuth<ISellResponse>(URL_UPDATE_ORDER_LINE, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const deleteSellDetail = async (body?: ISellRequest) => {
  const response = await fetcherWithAuth<ISellResponse>(URL_DELETE_ORDER_LINE, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const getSellIndex = async () => {
  const response = await fetcherWithAuth<string>(URL_ORDER_INDEX, {
    method: METHODS.POST,
  });

  return response;
};

export const createManySells = async (body: { data: ISellInput[] }) => {
  const response = await fetcherWithAuth<ISellResponse>(
    URL_CREATE_MANY_ORDERS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const getSellDetailByIds = async (body: ISellDetailRequest) => {
  const response = await fetcherWithAuth<ISellDetailResponse>(
    URL_GET_ORDER_LINES,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};
