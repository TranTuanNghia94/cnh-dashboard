import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_VENDOR,
  URL_DELETE_VENDOR,
  URL_GET_VENDORS,
  URL_UPDATE_VENDOR,
} from "@/lib/url";
import { IVendorRequest, IVendorResponse } from "@/types/vendor";

export const getAllVendors = async (body?: IVendorRequest) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_GET_VENDORS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const createVendor = async (body: IVendorRequest) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_CREATE_VENDOR, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const updateVendor = async (body: IVendorRequest) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_UPDATE_VENDOR, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const deleteVendor = async (body: IVendorRequest) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_DELETE_VENDOR, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};
