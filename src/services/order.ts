import { fetcherWithAuth, METHODS } from "@/lib/api";
import {
    URL_CREATE_ORDER,
    URL_DELETE_ORDER,
    URL_GET_ALL_ORDERS,
    URL_GET_ORDER_BY_CODE,
    URL_UPLOAD_FILE_BATCH_ORDER,
    URL_UPDATE_ORDER,
    URL_UPDATE_ORDER_STATUS,
    URL_UPLOAD_FILE_BATCH_ORDER_ASYNC,
    URL_BATCH_ORDER_IMPORT_JOB,
} from "@/lib/url";
import type { IBatchOrderImportJob } from "@/types/batch-order-import";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";
import { IOrderCreateRequest, IOrderResponse, IOrderUpdateStatusRequest } from "@/types/order";



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

export const updateOrderStatus = async (body: IOrderUpdateStatusRequest) => {
    const response = await fetcherWithAuth<IOrderResponse>(URL_UPDATE_ORDER_STATUS.replace('{id}', body.id), {
        method: METHODS.POST,
        data: { status: body.status },
    });

    return response;
}

export const uploadFileBatchOrder = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetcherWithAuth<unknown>(URL_UPLOAD_FILE_BATCH_ORDER, {
        method: METHODS.POST,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response;
}

export const uploadFileBatchOrderAsync = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetcherWithAuth<unknown>(URL_UPLOAD_FILE_BATCH_ORDER_ASYNC, {
        method: METHODS.POST,
        data: formData,
    });

    return response;
}

export const getBatchOrderImportJob = async (jobId: string) => {
    const response = await fetcherWithAuth<IBatchOrderImportJob>(
        URL_BATCH_ORDER_IMPORT_JOB.replace('{jobId}', jobId),
        { method: METHODS.GET },
    );

    return response;
}