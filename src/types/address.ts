export interface IAddressResponse {
    id: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface IAddressRequestCreate {
    customerId?: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
}