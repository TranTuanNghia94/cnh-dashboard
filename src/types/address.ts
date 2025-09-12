export interface IAddressResponse {
    id: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
    customerId: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface IAddressRequestCreate {
    id?: string;
    customerId?: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
    isDeleted?: boolean;
}