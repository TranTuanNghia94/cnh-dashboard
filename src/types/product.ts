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
    category: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}


export interface ICreateProductRequest { 
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
    categoryId: string;
    isActive: boolean;
}
