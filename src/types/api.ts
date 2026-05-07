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
    take?: number | undefined;
    search?: string | undefined;
    sortBy?:  string | undefined;
    sortOrder?: string | undefined;
    [key: string]: unknown;
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

export interface IErrorResponse {
	errorCode: string;
	errorMessage: string;
	status: number;
	timestamp: string;
	success: boolean;
	requestId: string;
}

export interface IUploadFileResponse {
    message: string;
    errors: string[];
    totalRows: number;
    totalErrors: number;
    totalSuccess: number;
}