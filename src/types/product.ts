export interface IProductResponse { 
    id: string;
    name: string;
    code: string;
    unit1: string;
    unit2: string;
    description: string;
    price: string;
    tax: string;
    misaCode: string;
    costPrice: string;
    imageUrl: string;
    categoryName: string;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}


export interface ICreateProductRequest { 
    name: string;
    code: string;
    unit1: string;
    unit2?: string;
    description?: string;
    price?: number;
    tax: number;
    misaCode?: string;
    costPrice?: number;
    imageUrl?: string;
    categoryId: string;
    isActive: boolean;
}

export interface IUpdateProductRequest {
    id: string;
    name: string;
    code: string;
    unit1: string;
    unit2?: string;
    description?: string;
    price?: number;
    tax?: number;
    misaCode?: string;
    costPrice?: number;
    imageUrl?: string;
    categoryId: string;
    isActive: boolean;
}