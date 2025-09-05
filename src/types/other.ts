import { IPaymentResponse, IPaymentWhere, IQueryPayment } from "./payment";
import { IUserResponse } from "./user";

export interface IGenericResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
  timestamp: string;
}


export type UuidFilter = {
	equals?: string;
	in?: string[];
	notIn?: string[];
	lt?: string;
	lte?: string;
	gt?: string;
	gte?: string;
	contains?: string;
	startsWith?: string;
	endsWith?: string;
	not?: string;
	mode?: 'default' | 'insensitive';
};

export type StringFilter = {
	equals?: string;
	in?: string[];
	notIn?: string[];
	lt?: string;
	lte?: string;
	gt?: string;
	gte?: string;
	contains?: string;
	startsWith?: string;
	endsWith?: string;
	not?: string;
	mode?: 'default' | 'insensitive';
};

export type StringNullableFilter = {
	equals?: string | null;
	in?: string[] | null;
	notIn?: string[] | null;
	lt?: string;
	lte?: string;
	gt?: string;
	gte?: string;
	contains?: string;
	startsWith?: string;
	not?: string | null;
	mode?: 'default' | 'insensitive';
};

export type StringNullableListFilter = {
	equals?: string[] | null;
	has?: string | null;
	hasEvery?: string[];
	hasSome?: string[];
	isEmpty?: boolean;
};


export interface IQueryApprove {
	metadata?: boolean;
	version?: boolean;
	id?: boolean;
	id_deNghiThanhToan?: boolean;
	approved?: boolean;
	ghiChu?: boolean;
	createdBy?: boolean;
	updatedBy?: boolean;
	createdAt?: boolean;
	updatedAt?: boolean;
	deletedAt?: boolean;
	DeNghiThanhToan?: boolean | IQueryPayment;
	CreatedBy?: boolean | IUserResponse;
	UpdatedBy?: boolean | IUserResponse;
}

export interface IApproveInput {
	metadata?: object;
	version?: number;
	id?: string;
	approval?: boolean;
	ghiChu?: string[];
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
	deletedAt?: Date | string | null;
}

export interface IApproveWhere {
	AND?: IApproveWhere | IApproveWhere[];
	OR?: IApproveWhere[];
	NOT?: IApproveWhere | IApproveWhere[];
	metadata?: object;
	version?: number;
	id?: string;
	id_deNghiThanhToan?: string | null;
	approved?: boolean;
	ghiChu?: StringNullableFilter;
	createdBy?: string | null;
	updatedBy?: string | null;
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
	deletedAt?: Date | string | null;
	DeNghiThanhToan?: IPaymentWhere | null;
	CreatedBy?: IUserWhere | null;
	UpdatedBy?: IUserWhere | null;
}

export interface IApproveResponse {
	metadata: object;
	version: number;
	id: string;
	DeNghiThanhToan?: IPaymentResponse;
	id_deNghiThanhToan: string;
	approved: boolean;
	ghiChu: string[];
	CreatedBy?: IUserResponse;
	createdBy: string;
	UpdatedBy?: IUserResponse;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

export interface IApproveRequest {
	select?: IQueryApprove;
	take?: number;
	skip?: number;
	orderBy?: {
		[P in keyof IApproveRequest['select']]?: 'asc' | 'desc';
	};
	include?: IQueryApprove;
	where?: IApproveWhere;
}