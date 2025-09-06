export interface ICreateCategoryRequest {
	name: string;
	code: string;
	unit: string;
	description?: string | null;
	parentId?: string | null;
}

export interface IUpdateCategoryRequest {
	id: string;
	name: string;
	code: string;
	unit: string;
	description?: string | null;
	parentId?: string | null;
}

export interface ICategoryResponse {
	id: string;
	name: string;
	code: string;
	unit: string;
	description?: string | null;
	parentId?: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}