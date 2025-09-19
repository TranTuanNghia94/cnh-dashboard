export interface IVendorBanksCreateRequest {
	bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankAccountBranch?: string;
    bankAccountSwift?: string;
    bankAccountIban?: string;
    vendorId?: string;
}
export interface IVendorCreateRequest { 
	code: string;
    name: string;
    email: string;
    country: string;
    currency: string;
    phone: string;
    misaCode: string;
    address: string;
    taxCode: string;
    contactPerson: string;
    banks?: IVendorBanksCreateRequest[];
}


export interface IVendorBanksResponse { 
	id: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankAccountBranch: string;
    bankAccountSwift: string;
    bankAccountIban: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    isDeleted: boolean;
}

export interface IVendorResponse {
	id: string;
    code: string;
    name: string;
    email: string;
    country: string;
    currency: string;
    phone: string;
    misaCode: string;
    address: string;
    taxCode: string;
    contactPerson: string;
    banks: IVendorBanksResponse[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    isDeleted: boolean;
}


export interface IVendorBanksUpdateRequest {
    id: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankAccountBranch?: string;
    bankAccountSwift?: string;
    bankAccountIban?: string;
    isDeleted: boolean;
    vendorId: string;
}

export interface IVendorUpdateRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    taxCode: string;
    misaCode: string;
    address: string;
    contactPerson: string;
    banks: IVendorBanksUpdateRequest[];
}