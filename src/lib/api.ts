import { getCookie, REFRESH_TOKEN, TOKEN } from "./cookie";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { IGenericResponse } from "@/types/other";

export const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
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

export const fetcherWithAuth = async <T>(
  url: string,
  config?: AxiosRequestConfig
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
    const errorFortmat = axiosError.response?.data;
    throw errorFortmat;
  }
};
