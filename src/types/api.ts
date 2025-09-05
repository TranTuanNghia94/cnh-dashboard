export interface IResponseAPI<T> {
	status?: number; // HTTP Code
	message?: unknown;
	results?: T[];
	metadata?: IPagination; // Pagination data
}

export interface IPagination {
	total?: number;
	skip: number;
	take: number;
	currentCursor?: string;
	nextCursor?: string;
}

export interface IPaginationAndSearch<T, S = unknown> {
	take?: number | undefined;
	skip?: number | undefined;
	search?: T | undefined;
	orderBy?: S | undefined;
}

export interface IRequestPaginationAndSearch {
	page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?:  string | undefined;
    sortOrder?: string | undefined;
}

export interface IPaginationModel {
	page: number;
    limit: number;
    total: number;
    totalPage: number;
}

export interface IResponsePaginationAndSearch<T> {
	data: T[];
    pagination: IPaginationModel;
}