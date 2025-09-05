import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CHANGE_PASSWORD,
  URL_LIST_USERS,
  URL_ME,
  URL_CREATE_USER,
  URL_LIST_ROLES,
  URL_GET_USER_BY_ID,
} from "@/lib/url";
import { ICreateUserInput, IRolesResponse, IUserResponse } from "@/types";
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

export const getUserById = async (id: string) => {
  const response = await fetcherWithAuth<IUserResponse>(URL_GET_USER_BY_ID.replace('{id}', id), {
    method: METHODS.GET
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
  const response = await fetcherWithAuth<IResponsePaginationAndSearch<IRolesResponse>>(URL_LIST_ROLES, {
    method: METHODS.GET,
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

  export const createUser = async (data: ICreateUserInput) => {
    const response = await fetcherWithAuth<IUserResponse>(URL_CREATE_USER, {
      method: METHODS.POST,
      data,
    });

    return response;
  };

  // export const updateUser = async (data: IUserRequest) => {
  //   const response = await fetcherWithAuth<IUserResponse>(URL_UPDATE_USER, {
  //     method: METHODS.POST,
  //     data,
  //   });

  //   return response;
  // };