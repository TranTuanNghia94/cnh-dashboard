import { IGoodsResponse } from "./goods";
import { IPaymentResponse } from "./payment";
import { Prisma } from "./schema";
import { ISellDetailResponse, ISellResponse } from "./sell";
import { IUserResponse } from "./user";
import { IVendorResponse } from "./vendor";



export interface IConnectCustomer {
	connect?: {
		id?: string;
		maKhachHang?: string;
	};
}

export interface IConnectDelivery {
	connect?: {
		id?: string;
		tenNguoiLienHe_soDienThoai?: {
			tenNguoiLienHe: string;
			soDienThoai: string;
		};
	};
}

export interface IConnectVendor {
	connect?: {
		id?: string;
		maNhaCungCap?: string;
		tenNhaCungCap?: string;
	};
}

export interface IConnectGoods {
	connect?: {
		id?: string;
		maHangHoa?: string;
		tenHang?: string;
	};
}

export interface IConnectUser {
	connect?: {
		id?: string;
		maNhanVien?: string;
	};
}

export interface IQueryPurchase extends Prisma.DonMuaHangSelect {}

export interface IPurchaseWhere extends Prisma.DonMuaHangWhereInput {}

export interface IPurchaseInput extends Prisma.DonMuaHangCreateInput {}


export interface IPurchaseRequest {
	select?: IQueryPurchase;
	take?: number | undefined;
	skip?: number | undefined;
	where?: IPurchaseWhere;
	include?: IQueryPurchase;
	orderBy?: Prisma.DonMuaHangOrderByWithRelationInput | Prisma.DonMuaHangOrderByWithRelationInput[] | unknown;
	data?: IPurchaseInput;
}

export interface IPurchaseResponse {
	metadata: object;
	version: number;
	id: string;
	purchaseOrderNumber: string;
	DonBanHang_s?: ISellResponse[];
	DonMuaHangChiTiet_s?: IPurchaseDetailResponse[];
	DeNghiThanhToan_s?: IPaymentResponse[];
	status: 'DRAFT' | 'OPEN' | 'CLOSED_PURCHASING' | 'CLOSED_COMPLETE' | 'CANCELLED' | 'CLOSED_FOR_RECEIVING';
	ghiChu: string[];
	CreatedBy?: IUserResponse;
	createdBy: string;
	UpdatedBy?: IUserResponse;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}

export interface IQueryPurchaseDetail extends Prisma.DonMuaHangChiTietSelect {}



export interface IPurchaseDetailWhere extends Prisma.DonMuaHangChiTietWhereInput {}

export interface IPurchaseDetailInput extends Prisma.DonMuaHangChiTietCreateInput {}

export interface IPurchaseDetailRequest {
	select?: IQueryPurchaseDetail;
	take?: number | undefined;
	skip?: number | undefined;
	where?: IPurchaseDetailWhere;
	include?: Prisma.DonMuaHangChiTietInclude | Prisma.DonMuaHangChiTietInclude[];
	orderBy?: Prisma.DonMuaHangChiTietOrderByWithRelationInput | Prisma.DonMuaHangChiTietOrderByWithRelationInput[] | unknown;
	data?: IPurchaseDetailInput;
}

export interface IPurchaseDetailResponse {
	metadata?: object;
	version?: number;
	id?: string;
	DonMuaHang?: IPurchaseResponse;
	id_Po?: string;
	ChiTietDonBanHang?: ISellDetailResponse;
	id_ChiTietDonBanHang?: string;
	HangHoa?: IGoodsResponse;
	id_HangHoa?: string;
	link?: string;
	NhaCungCap?: IVendorResponse;
	id_NhaCungCap?: string;
	soLuong?: string;
	donViTinh?: string;
	donViTinh_2?: string;
	donGia?: string;
	daBaoGomThue?: boolean;
	thue?: string;
	thanhTienTruocThue?: string;
	thanhTien?: string;
	ngoaiTe?: string;
	status?: 'DRAFT' | 'OPEN' | 'CLOSED_PURCHASING' | 'CLOSED_COMPLETE' | 'CANCELLED' | 'CLOSED_FOR_RECEIVING';
	ghiChu?: string[];
	i_quote?: string;
	i_invoice?: string;
	i_billOfLanding?: string;
	i_receiptWarehouse?: string;
	i_trackId?: string;
	i_purchaseContractNumber?: string;
	CreatedBy?: IUserResponse;
	createdBy?: string;
	UpdatedBy?: IUserResponse;
	updatedBy?: string;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}