import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CHANGE_PASSWORD,
  URL_GET_ALL_ROLES,
  URL_LIST_USERS,
  URL_ME,
} from "@/lib/url";
import { IRolesResponse, IUserResponse } from "@/types";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";

export const getAllUsers = async (body?: IRequestPaginationAndSearch) => {
  const response = await fetcherWithAuth<IResponsePaginationAndSearch<IUserResponse>>(URL_LIST_USERS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const getMe = async () => {
  const response = await fetcherWithAuth<IUserResponse>(URL_ME, {
    method: METHODS.POST,
  });

  return response;
};

export const changePassword = async (data: {
  oldPwd: string;
  newPwd: string;
}) => {
  const response = await fetcherWithAuth<IUserResponse>(URL_CHANGE_PASSWORD, {
    method: METHODS.POST,
    data,
  });

  return response;
};

export const getAllRoles = async () => {
  const response = await fetcherWithAuth<IRolesResponse>(URL_GET_ALL_ROLES, {
    method: METHODS.POST,
  });

  return response;
};

  // export const disableUser = async (data: IUserRequest) => {
  //   const response = await fetcherWithAuth<IUserResponse>(URL_DISABLE_USER, {
  //     method: METHODS.POST,
  //     data,
  //   });

  //   return response;
  // };

  // export const createUser = async (data: IUserRequest) => {
  //   const response = await fetcherWithAuth<IUserResponse>(URL_CREATE_USER, {
  //     method: METHODS.POST,
  //     data,
  //   });

  //   return response;
  // };

  // export const updateUser = async (data: IUserRequest) => {
  //   const response = await fetcherWithAuth<IUserResponse>(URL_UPDATE_USER, {
  //     method: METHODS.POST,
  //     data,
  //   });

  //   return response;
  // };