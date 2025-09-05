import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
  URL_CREATE_CUSTOMER,
  URL_DELETE_CONTACTS,
  URL_DELETE_CUSTOMER,
  URL_GET_CONTACTS,
  URL_GET_CUSTOMERS,
  URL_UPDATE_CONTACTS,
  URL_UPDATE_CUSTOMER,
} from "@/lib/url";
import {
  ICustomerAddressRequest,
  ICustomerAddressResponse,
  ICustomerRequest,
  ICustomerResponse,
} from "@/types/customer";

export const getAllCustomers = async (body?: ICustomerRequest) => {
  const response = await fetcherWithAuth<ICustomerResponse>(URL_GET_CUSTOMERS, {
    method: METHODS.POST,
    data: body,
  });

  return response;
};

export const createCustomer = async (body: ICustomerRequest) => {
  const response = await fetcherWithAuth<ICustomerResponse>(
    URL_CREATE_CUSTOMER,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const updateCustomer = async (body: ICustomerRequest) => {
  const response = await fetcherWithAuth<ICustomerResponse>(
    URL_UPDATE_CUSTOMER,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const deleteCustomer = async (body: ICustomerRequest) => {
  const response = await fetcherWithAuth<ICustomerResponse>(
    URL_DELETE_CUSTOMER,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const getAddressByCustomerId = async (body: ICustomerAddressRequest) => {
  const response = await fetcherWithAuth<ICustomerAddressResponse>(
    URL_GET_CONTACTS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const updateAddress = async (body: ICustomerAddressRequest) => {
  const response = await fetcherWithAuth<ICustomerAddressResponse>(
    URL_UPDATE_CONTACTS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};

export const deleteAddress = async (body: ICustomerAddressRequest) => {
  const response = await fetcherWithAuth<ICustomerAddressResponse>(
    URL_DELETE_CONTACTS,
    {
      method: METHODS.POST,
      data: body,
    }
  );

  return response;
};
