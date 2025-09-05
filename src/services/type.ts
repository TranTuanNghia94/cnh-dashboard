import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_GROUP_OF_GOODS,
  URL_DELETE_GROUP_OF_GOODS,
  URL_GET_GROUP_OF_GOODS,
  URL_UPDATE_GROUP_OF_GOODS,
} from "@/lib/url";
import { IGroupOfGoodsRequest, IGroupOfGoodsResponse } from "@/types/type";

export const getAllTypes = async (body?: IGroupOfGoodsRequest) => {
  const response = await fetcherWithAuth<IGroupOfGoodsResponse>(
    URL_GET_GROUP_OF_GOODS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const createType = async (body?: IGroupOfGoodsRequest) => {
  const response = await fetcherWithAuth<IGroupOfGoodsResponse>(
    URL_CREATE_GROUP_OF_GOODS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const updateType = async (body?: IGroupOfGoodsRequest) => {
  const response = await fetcherWithAuth<IGroupOfGoodsResponse>(
    URL_UPDATE_GROUP_OF_GOODS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const deleteType = async (body?: IGroupOfGoodsRequest) => {
  const response = await fetcherWithAuth<IGroupOfGoodsResponse>(
    URL_DELETE_GROUP_OF_GOODS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};
