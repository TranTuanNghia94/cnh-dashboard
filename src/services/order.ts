import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
    URL_CREATE_ORDER,
    URL_DELETE_ORDER,
    URL_GET_ALL_ORDERS,
    URL_GET_ORDER_BY_CODE,
    URL_UPDATE_ORDER
} from "@/lib/url";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";
import { IOrderCreateRequest, IOrderResponse } from "@/types/order";



export const getAllOrders = async (body?: IRequestPaginationAndSearch) => { 
    const response = await fetcherWithAuth<IResponsePaginationAndSearch<IOrderResponse>>(URL_GET_ALL_ORDERS, {
        method: METHODS.POST,
        data: body,
    });

    return response;
}

export const getOrderByCode = async (code: string) => {
    const response = await fetcherWithAuth<IOrderResponse>(URL_GET_ORDER_BY_CODE.replace('{code}', code), {
        method: METHODS.GET
    });

    return response;
}

export const createOrder = async (body?: IOrderCreateRequest) => {
    const response = await fetcherWithAuth<IOrderResponse>(URL_CREATE_ORDER, {
        method: METHODS.POST,
        data: body,
    });

    return response;
}

export const deleteOrder = async (id: string) => {
    const response = await fetcherWithAuth<IOrderResponse>(URL_DELETE_ORDER.replace('{id}', id), {
        method: METHODS.DELETE
    });

    return response;
}

export const updateOrder = async (body?: IOrderCreateRequest) => {
    const response = await fetcherWithAuth<IOrderResponse>(URL_UPDATE_ORDER, {
        method: METHODS.POST,
        data: body,
    });

    return response;
}
