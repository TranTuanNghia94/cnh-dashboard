import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_GOODS,
  URL_CREATE_MANY_GOODS,
  URL_DELETE_GOODS,
  URL_GET_GOODS,
  URL_UPDATE_GOODS,
  URL_VADIDATE_GOODS,
} from "@/lib/url";
import { IGoodsRequest, IGoodsResponse, IGoodsValidate } from "@/types/goods";

export const getAllGoods = async (body?: IGoodsRequest) => {
  const response = await fetcherWithAuth<IGoodsResponse>(URL_GET_GOODS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const createGoods = async (body: IGoodsRequest) => {
  const response = await fetcherWithAuth<IGoodsResponse>(URL_CREATE_GOODS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const updateGoods = async (body: IGoodsRequest) => {
  const response = await fetcherWithAuth<IGoodsResponse>(URL_UPDATE_GOODS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const deleteGoods = async (body: IGoodsRequest) => {
  const response = await fetcherWithAuth<IGoodsResponse>(URL_DELETE_GOODS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const validateGoods = async (body: IGoodsValidate[]) => {
  const response = await fetcherWithAuth<IGoodsValidate>(URL_VADIDATE_GOODS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const createManyGoods = async (body: IGoodsRequest) => {
  const response = await fetcherWithAuth<IGoodsResponse>(
    URL_CREATE_MANY_GOODS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};
