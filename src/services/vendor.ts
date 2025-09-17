import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_VENDOR,
  URL_DELETE_VENDOR,
  URL_GET_ALL_VENDORS,
  URL_GET_VENDOR_BY_ID,
} from "@/lib/url";
import { IVendorCreateRequest, IVendorResponse } from "@/types/vendor";
import { IRequestPaginationAndSearch } from "@/types/api";
import { IResponsePaginationAndSearch } from "@/types/api";

export const getAllVendors = async (body?: IRequestPaginationAndSearch) => {
  const response = await fetcherWithAuth<IResponsePaginationAndSearch<IVendorResponse>>(URL_GET_ALL_VENDORS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const getVendorById = async (id: string) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_GET_VENDOR_BY_ID.replace('{id}', id), {
    method: METHODS.GET,
  });

  return response;
};

export const createVendor = async (body: IVendorCreateRequest) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_CREATE_VENDOR, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

// export const updateVendor = async (body: IVendorRequest) => {
//   const response = await fetcherWithAuth<IVendorResponse>(URL_UPDATE_VENDOR, {
//     method: METHODS.POST,
//     data: body,
//   });

//   return response;
// };

export const deleteVendor = async (id: string) => {
  const response = await fetcherWithAuth<IVendorResponse>(URL_DELETE_VENDOR.replace('{id}', id), {
    method: METHODS.DELETE,
  });

  return response;
};
