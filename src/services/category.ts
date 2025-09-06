import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_CREATE_CATEGORY, URL_DELETE_CATEGORY, URL_GET_ALL_CATEGORIES, URL_GET_CATEGORY_BY_ID, URL_UPDATE_CATEGORY } from "@/lib/url";
import { IResponsePaginationAndSearch } from "@/types/api";
import { ICategoryResponse, ICreateCategoryRequest, IUpdateCategoryRequest } from "@/types/category";

export const createCategory = async (payload?: ICreateCategoryRequest) => {
  const response = await fetcherWithAuth<ICategoryResponse>(
    URL_CREATE_CATEGORY,
    {
      method: METHODS.POST,
      data: payload,
    }
  );

  return response;
};

export const getAllCategories = async () => {
  const response = await fetcherWithAuth<
    IResponsePaginationAndSearch<ICategoryResponse>
  >(URL_GET_ALL_CATEGORIES, {
    method: METHODS.GET,
  });

  return response;
};

export const getCategoryById = async (id: string) => {
  const response = await fetcherWithAuth<ICategoryResponse>(
    URL_GET_CATEGORY_BY_ID.replace('{id}', id),
    {
      method: METHODS.GET,
    }
  );

  return response;
};

export const deleteCategory = async (id: string) => {
  const response = await fetcherWithAuth<ICategoryResponse>(
    URL_DELETE_CATEGORY.replace('{id}', id),
    {
      method: METHODS.DELETE,
    }
  );

  return response;
};

export const updateCategory = async (payload?: IUpdateCategoryRequest) => {
  const response = await fetcherWithAuth<ICategoryResponse>(
    URL_UPDATE_CATEGORY,
    {
      method: METHODS.PUT,
      data: payload,
    }
  );

  return response;
};