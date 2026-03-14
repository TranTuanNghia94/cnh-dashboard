import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_CREATE_PRODUCT, URL_DELETE_PRODUCT, URL_GET_ALL_PRODUCTS, URL_GET_PRODUCT_BY_CODE, URL_GET_PRODUCT_BY_ID, URL_UPDATE_PRODUCT, URL_UPLOAD_FILE_PRODUCT } from "@/lib/url";
import { IRequestPaginationAndSearch, IResponsePaginationAndSearch } from "@/types/api";
import { ICreateProductRequest, IProductResponse, IUpdateProductRequest, IUploadFileProductResponse } from "@/types/product";


export const getAllProducts = async (body?: IRequestPaginationAndSearch) => { 
    const response = await fetcherWithAuth<IResponsePaginationAndSearch<IProductResponse>>(URL_GET_ALL_PRODUCTS, {
        method: METHODS.POST,
        data: body,
    });

    return response;
}

export const createProduct = async (body?: ICreateProductRequest) => {
    const response = await fetcherWithAuth<IProductResponse>(URL_CREATE_PRODUCT, {
        method: METHODS.POST,
        data: body,
    });

    return response;
}

export const getProductById = async (id: string) => {
    const response = await fetcherWithAuth<IProductResponse>(URL_GET_PRODUCT_BY_ID.replace('{id}', id), {
        method: METHODS.GET
    });

    return response;
}

export const getProductByCode = async (code: string) => {
    const response = await fetcherWithAuth<IProductResponse>(URL_GET_PRODUCT_BY_CODE.replace('{code}', code), {
        method: METHODS.GET
    });

    return response;
}

export const deleteProduct = async (id: string) => {
    const response = await fetcherWithAuth<IProductResponse>(URL_DELETE_PRODUCT.replace('{id}', id), {
        method: METHODS.DELETE
    });

    return response;
}

export const updateProduct = async (body?: IUpdateProductRequest) => {
    const response = await fetcherWithAuth<IProductResponse>(URL_UPDATE_PRODUCT, {
        method: METHODS.POST,
        data: body,
    });

    return response;
}

export const uploadFileProduct = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetcherWithAuth<IUploadFileProductResponse>(URL_UPLOAD_FILE_PRODUCT, {
        method: METHODS.POST,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response;
}