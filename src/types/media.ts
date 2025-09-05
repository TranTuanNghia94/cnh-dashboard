import { StringFilter, StringNullableFilter } from "./other";
import { IPaymentRequest, IPaymentResponse } from "./payment";
import { IUserRequest, IUserResponse } from "./user";


export interface IQueryMedias {
	metadata?: boolean;
	version?: boolean;
	id?: boolean;
	name?: boolean;
	ext?: boolean;
	mime?: boolean;
	size?: boolean;
	hash?: boolean;
	uri?: boolean;
	usedBySystem?: boolean;
	expiredAt?: boolean;
	isExpired?: boolean;
	quote_paymentRequest_id?: boolean;
	banknote_paymentRequest_id?: boolean;
	createdBy?: boolean;
	updatedBy?: boolean;
	createdAt?: boolean;
	updatedAt?: boolean;
	deletedAt?: boolean;
	DeNghiThanhToan_Quote?: boolean | IPaymentRequest;
	DeNghiThanhToan_BankNote?: boolean | IPaymentRequest;
	CreatedBy?: boolean | IUserRequest;
	UpdatedBy?: boolean | IUserRequest;
}

export interface IMediasInput {
	metadata?: object;
	version?: number;
	id?: string;
	name: string;
	ext?: string;
	mime?: string;
	size?: number;
	hash?: string;
	uri?: string;
	usedBySystem?: boolean;
	expiredAt?: Date | string;
	isExpired?: boolean;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
	DeNghiThanhToan_BankNote?: {
		connect?: {
			id?: string;
		};
	};
	CreatedBy?: IUserRequest;
	UpdatedBy?: IUserRequest;
}

export interface IMediasWhere {
	AND?: IMediasWhere | IMediasWhere[];
	OR?: IMediasWhere[];
	NOT?: IMediasWhere | IMediasWhere[];
	metadata?: object;
	version?: number;
	id?: string | StringFilter;
	name?: string;
	ext?: string | null;
	mime?: StringNullableFilter | string | null;
	size?: number | null;
	hash?: StringNullableFilter | string | null;
	uri?: StringNullableFilter | string | null;
	usedBySystem?: boolean;
	expiredAt?: Date | string | null;
	isExpired?: boolean;
	id_PaymentReqToQuote?: string | null;
	id_PaymentReqToBanknote?: string | null;
	createdBy?: string;
	updatedBy?: string;
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
	deletedAt?: Date | string | null;
	DeNghiThanhToan_Quote?: IPaymentRequest | null;
	DeNghiThanhToan_BankNote?: IPaymentRequest | null;
	CreatedBy?: IUserRequest;
	UpdatedBy?: IUserRequest;
}

export interface IMediasRequest {
	select?: IQueryMedias;
	take?: number;
	skip?: number;
	orderBy?: {
		[P in keyof IMediasRequest['select']]?: 'asc' | 'desc';
	};
	include?: IQueryMedias;
	where?: IMediasWhere;
}

export interface IMediasResponse {
	metadata: object;
	version: number;
	id: string;
	name: string;
	ext: string;
	mime: string;
	size: number;
	hash: string;
	uri: string;
	status?: string;
	usedBySystem?: boolean;
	expiredAt?: Date;
	isExpired?: boolean;
	DeNghiThanhToan_Quote?: IPaymentResponse;
	quote_paymentRequest_id?: string;
	DeNghiThanhToan_BankNote?: IPaymentResponse;
	banknote_paymentRequest_id?: string;
	CreatedBy?: IUserResponse;
	createdBy?: string;
	UpdatedBy?: IUserResponse;
	updatedBy?: string;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}