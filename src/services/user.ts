import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_ASSIGN_ROLE_TO_USER,
  URL_CHANGE_PASSWORD,
  URL_LIST_USERS,
  URL_ME,
  URL_UNASSIGN_ROLE_FROM_USER,
  URL_UPDATE_MY_PROFILE,
  URL_CREATE_USER,
  URL_GET_USER_BY_ID,
} from "@/lib/url";
import { IChangeMyPasswordInput, ICreateUserInput, IUpdateMyProfileInput, IUserResponse } from "@/types";
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
    method: METHODS.GET,
  });

  return response;
};

export const getUserById = async (id: string) => {
  const response = await fetcherWithAuth<IUserResponse>(URL_GET_USER_BY_ID.replace('{id}', id), {
    method: METHODS.GET
  });

  return response;
};

export const updateMyProfile = async (data: IUpdateMyProfileInput) => {
  const response = await fetcherWithAuth<IUserResponse>(URL_UPDATE_MY_PROFILE, {
    method: METHODS.POST,
    data,
  });

  return response;
};

export const changePassword = async (data: IChangeMyPasswordInput) => {
  const response = await fetcherWithAuth<IUserResponse>(URL_CHANGE_PASSWORD, {
    method: METHODS.POST,
    data,
  });

  return response;
};

export const assignRoleToUser = async (userId: string, roleId: string) => {
  const url = URL_ASSIGN_ROLE_TO_USER.replace('{userId}', userId).replace(
    '{roleId}',
    roleId,
  );

  const response = await fetcherWithAuth<string>(url, {
    method: METHODS.POST,
  });

  return response;
};

export const unassignRoleFromUser = async (userId: string, roleId: string) => {
  const url = URL_UNASSIGN_ROLE_FROM_USER.replace('{userId}', userId).replace(
    '{roleId}',
    roleId,
  );

  const response = await fetcherWithAuth<string>(url, {
    method: METHODS.POST,
  });

  return response;
};

export const createUser = async (data: ICreateUserInput) => {
    const response = await fetcherWithAuth<IUserResponse>(URL_CREATE_USER, {
      method: METHODS.POST,
      data,
    });

    return response;
  };
