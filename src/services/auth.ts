import { fetcher, METHODS } from "@/lib/api";
import { URL_LOGIN } from "@/lib/url";
import { IAuth, IUserAuth } from "@/types";


export const login = async (body: IUserAuth) => {
  const response = await fetcher<IAuth>(URL_LOGIN, {
    data: body,
    method: METHODS.POST,
  });

  return response;
};
