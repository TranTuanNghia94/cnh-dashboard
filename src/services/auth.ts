import { fetcher, fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_LOGIN, URL_LOGOUT } from "@/lib/url";
import { IAuth, IUserAuth } from "@/types";


export const login = async (body: IUserAuth) => {
  const response = await fetcher<IAuth>(URL_LOGIN, {
    data: body,
    method: METHODS.POST,
  });

  return response;
};


export const logout = async () => {
  const response = await fetcherWithAuth<string>(URL_LOGOUT, {
    method: METHODS.POST,
  });

  return response;
};