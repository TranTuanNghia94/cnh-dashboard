import { Prisma } from "./schema";


export interface IQueryCustomer extends  Prisma.KhachHangSelect {}

export interface ICustomerWhere extends  Prisma.KhachHangWhereInput {}

export interface ICustomerInput extends Prisma.KhachHangCreateInput {}

export interface ICustomerRequest {
	select?: IQueryCustomer;
	where?: ICustomerWhere;
	take?: number;
	skip?: number;
	include?: IQueryCustomer;
	orderBy?: Prisma.KhachHangOrderByWithRelationInput | Prisma.KhachHangOrderByWithRelationInput[] | unknown;
	data?: ICustomerInput;
}

export interface ICustomerResponse {
	metadata?: object;
	version?: number;
	id?: string;
	misaCode?: string;
	maKhachHang: string;
	tenKhachHang: string;
	email?: string;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
	LienHe?: IAddressResponse[];
	LienHe_s?: IAddressResponse[];
}

export interface IAddressResponse {
	metadata?: object;
	version?: number;
	id?: string;
	tenNguoiLienHe?: string;
	soDienThoai?: string;
	email?: string;
	soNhaTenDuong_1?: string;
	soNhaTenDuong_2?: string;
	phuongXa?: string;
	quanHuyen?: string;
	tinhThanh?: string;
	maKhachHang?: string;
	isActive?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}


export interface IQueryCustomerAddress extends Prisma.KhachHangDiaChiLienHeSelect{}


export interface ICustomerAddressWhere extends Prisma.KhachHangDiaChiLienHeWhereInput{}


export interface ICustomerAddressInput extends Prisma.KhachHangDiaChiLienHeCreateInput{}


export interface ICustomerAddressRequest {
	select?: IQueryCustomerAddress;
	where?: ICustomerAddressWhere;
	take?: number;
	skip?: number;
	include?: IQueryCustomerAddress;
	orderBy?: Prisma.KhachHangOrderByWithAggregationInput | Prisma.KhachHangOrderByWithAggregationInput[],
	data?: ICustomerAddressInput;
}

export interface ICustomerAddressResponse {
	metadata?: object;
	version?: number;
	id?: string;
	tenNguoiLienHe?: string;
	soDienThoai?: string;
	email?: string;
	soNhaTenDuong_1?: string;
	soNhaTenDuong_2?: string;
	phuongXa?: string;
	quanHuyen?: string;
	tinhThanh?: string;
	maKhachHang?: string;
	isActive?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}