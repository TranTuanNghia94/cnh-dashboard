import { Prisma } from "./schema";


export type IQueryVendor = Prisma.NhaCungCapSelect

export type IVendorInput = Prisma.NhaCungCapCreateInput

export interface IVendorRequest {
	select?: IQueryVendor;
	take?: number | undefined;
	skip?: number | undefined;
	where?: IVendorWhere;
	include?: Prisma.NhaCungCapInclude | Prisma.NhaCungCapInclude[];
	orderBy?: Prisma.NhaCungCapOrderByWithRelationInput | Prisma.NhaCungCapOrderByWithRelationInput[] | unknown;
	data?: IVendorInput | Prisma.NhaCungCapUpdateInput;
}

export type IVendorWhere = Prisma.NhaCungCapWhereInput

export interface IVendorResponse {
	metadata?: object | undefined;
	version?: number | undefined;
	id: string;
	maNhaCungCap: string;
	tenNhaCungCap?: string;
	email?: string | undefined;
	quocGia?: string | undefined;
	misaCode?: string | undefined;
	ngoaiTe?: string | undefined;
	address?: string | undefined
	bank_name?: string | undefined
	bank_address?: string |undefined
	bank_accountNum?: string |undefined
	bank_accountName?: string | undefined
	bank_ibanNum?: string | null;
	bank_swiftCode?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
	// DonMuaHangChiTiet_s?: IPaymentDetailResponse[];
}