import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_CUSTOMER,
  URL_DELETE_CUSTOMER,
  URL_GET_ALL_CUSTOMERS,
  URL_GET_CUSTOMER_BY_ID,
} from "@/lib/url";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";
import {
  ICustomerRequestCreate,
  ICustomerResponse,
} from "@/types/customer";

export const getAllCustomers = async (body?: IRequestPaginationAndSearch) => {
  const response = await fetcherWithAuth<IResponsePaginationAndSearch<ICustomerResponse>>(URL_GET_ALL_CUSTOMERS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const getCustomerById = async (id: string) => {
  const response = await fetcherWithAuth<ICustomerResponse>(URL_GET_CUSTOMER_BY_ID.replace('{id}', id), {
    method: METHODS.GET,
  });
  return response;
};

export const createCustomer = async (body: ICustomerRequestCreate) => {
  const response = await fetcherWithAuth<ICustomerResponse>(
    URL_CREATE_CUSTOMER,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

// export const updateCustomer = async (body: ICustomerRequest) => {
//   const response = await fetcherWithAuth<ICustomerResponse>(
//     URL_UPDATE_CUSTOMER,
//     {
//       method: METHODS.POST,
//       data: body,
//     }
//   );

//   return response;
// };

export const deleteCustomer = async (id: string) => {
  const response = await fetcherWithAuth<ICustomerResponse>(
    URL_DELETE_CUSTOMER.replace('{id}', id),
    {
      method: METHODS.DELETE,
    }
  );

  return response;
};

// export const getAddressByCustomerId = async (body: ICustomerAddressRequest) => {
//   const response = await fetcherWithAuth<ICustomerAddressResponse>(
//     URL_GET_CONTACTS,
//     {
//       method: METHODS.POST,
//       data: body,
//     }
//   );

//   return response;
// };

// export const updateAddress = async (body: ICustomerAddressRequest) => {
//   const response = await fetcherWithAuth<ICustomerAddressResponse>(
//     URL_UPDATE_CONTACTS,
//     {
//       method: METHODS.POST,
//       data: body,
//     }
//   );

//   return response;
// };

// export const deleteAddress = async (body: ICustomerAddressRequest) => {
//   const response = await fetcherWithAuth<ICustomerAddressResponse>(
//     URL_DELETE_CONTACTS,
//     {
//       method: METHODS.POST,
//       data: body,
//     }
//   );

//   return response;
// };
