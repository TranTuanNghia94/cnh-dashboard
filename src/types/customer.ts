import { IAddressRequestCreate, IAddressResponse } from "./address";

export interface ICustomerResponse {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    taxCode: string;
    misaCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
    addresses: IAddressResponse[];
}


export interface ICustomerRequestCreate {
    code: string;
    name: string;
    email: string;
    phone: string;
    taxCode: string;
    misaCode: string;
    addresses: IAddressRequestCreate[];
}