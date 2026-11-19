import { getCookie, REFRESH_TOKEN, setCookie, TOKEN } from "./cookie";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { IGenericResponse } from "@/types/other";
import { redirectToLogin } from "@/lib/auth-guard";
import { decodeJwt } from "@/lib/jwt";
import { IAuth, JwtData } from "@/types";
import { URL_REFRESH_TOKEN } from "@/lib/url";

export const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_DEV_API_URL;

const TIME_OUT = 120000; // 2 minutes in milliseconds,

export const createAPIClient = (
  url: string,
  token?: string,
  refreshToken?: string
) => {
  const instance = axios.create({
    baseURL: url,
    timeout: TIME_OUT,
    timeoutErrorMessage: "Request timeout",
  });

  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  if (refreshToken) {
    instance.defaults.headers.common["Refresh-Token"] = refreshToken;
  }

  return instance;
};

export const fetcher = async <T>(url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await createAPIClient(BASE_URL).request<IGenericResponse<T>>({
      url,
      ...config,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const errorFortmat = axiosError.response?.data;
    throw errorFortmat;
  }
};

let refreshPromise: Promise<boolean> | null = null;

const persistRefreshedTokens = (accessToken: string, refreshToken: string) => {
  const jwtData = decodeJwt(accessToken) as JwtData;
  const opt: Cookies.CookieAttributes = {
    expires: new Date(jwtData.exp * 1000),
  };
  setCookie(TOKEN, accessToken, opt);
  setCookie(REFRESH_TOKEN, refreshToken, opt);
};

/** BE expects @RequestBody String — send a JSON string body. */
const callRefreshToken = async (refreshToken: string) => {
  return fetcher<IAuth>(URL_REFRESH_TOKEN, {
    method: METHODS.POST,
    data: JSON.stringify(refreshToken),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const tryRefreshSession = async (): Promise<boolean> => {
  const currentRefresh = getCookie(REFRESH_TOKEN);
  if (!currentRefresh) {
    return false;
  }

  try {
    const response = await callRefreshToken(currentRefresh);
    if (!response?.data?.accessToken || !response?.data?.refreshToken) {
      return false;
    }
    persistRefreshedTokens(response.data.accessToken, response.data.refreshToken);
    return true;
  } catch {
    return false;
  }
};

const refreshSessionSingleFlight = () => {
  if (!refreshPromise) {
    refreshPromise = tryRefreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const fetcherWithAuth = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  retried = false
) => {
  const token = getCookie(TOKEN);
  const refreshToken = getCookie(REFRESH_TOKEN);
  try {
    const response = await createAPIClient(
      BASE_URL,
      token,
      refreshToken
    ).request<IGenericResponse<T>>({
      url,
      ...config,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401 && !retried) {
      const refreshed = await refreshSessionSingleFlight();
      if (refreshed) {
        return fetcherWithAuth<T>(url, config, true);
      }
      redirectToLogin();
    } else if (axiosError.response?.status === 401) {
      redirectToLogin();
    }
    const errorFortmat = axiosError.response?.data;
    throw errorFortmat;
  }
};
