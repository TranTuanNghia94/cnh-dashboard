import { IMediasResponse } from "./media";
import { IApproveResponse } from "./other";
import { IPurchaseResponse } from "./purchase";
import { Prisma } from "./schema";
import { ISellDetailResponse } from "./sell";
import { IUserResponse } from "./user";
import { IVendorResponse } from "./vendor";



export type PaymentStatus = 'DRAFT' | 'OPEN' | 'CANCELLED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface IConnectVendor {
	connect?: {
		id?: string;
	};
}

export interface IConnectUser {
	connect?: {
		id?: string;
	};
}

export interface IQueryPayment extends Prisma.DeNghiThanhToanSelect {}

export interface IPaymentWhere extends Prisma.DeNghiThanhToanWhereInput {}

export interface IPaymentInput extends Prisma.DeNghiThanhToanCreateInput {}

export interface IPaymentUpdate extends Prisma.DeNghiThanhToanUpdateInput {}

export interface IPaymentRequest {
	select?: IQueryPayment;
	take?: number;
	skip?: number;
	orderBy?: Prisma.DeNghiThanhToanOrderByWithRelationInput | Prisma.DeNghiThanhToanOrderByWithRelationInput[] | unknown;
	include?: IQueryPayment;
	where?: IPaymentWhere;
	data?: IPaymentInput | IPaymentInput[] | Prisma.DeNghiThanhToanUpdateInput;
}

export interface IPaymentResponse {
	metadata?: object;
	version?: number;
	id: string;
	maDeNghiThanhToan?: string;
	ThanhToanCho?: IVendorResponse;
	id_NhaCungCap?: string;
	is_NoiDia?: boolean;
	hanThanhToan?: Date;
	congTyThanhToan?: string;
	total?: number;
	tongSoTienCanThanhToan?: number;
	ngoaiTe?: string;
	ChiTietDeNghiThanhToan_s?: IPaymentDetailResponse[];
	Uploaded_BaoGia_s?: IMediasResponse[];
	Uploaded_BankNote_s?: IMediasResponse[];
	LichSuDuyet_s?: IApproveResponse[];
	DonMuaHang?: IPurchaseResponse;
	benBankName?: string;
	benBankAccountNo?: string;
	benName?: string;
	customer?: string;
	status?: PaymentStatus;
	CreatedBy?: IUserResponse;
	createdBy?: string;
	UpdatedBy?: IUserResponse;
	updatedBy?: string;
	tyGia?: number;
	tyLeThanhToan?: number;
	isFullyPaid?: boolean;
	ghiChu: string[];
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}

export interface IQueryPaymentDetail extends Prisma.DeNghiThanhToanChiTietSelect {}

export interface IPaymentDetailWhere extends Prisma.DeNghiThanhToanChiTietWhereInput {}

export interface IPaymentDetailInput extends Prisma.DeNghiThanhToanChiTietCreateInput {}

export interface IPaymentDetailRequest {
	select?: IQueryPaymentDetail;
	take?: number;
	skip?: number;
	data?: IPaymentDetailInput | Prisma.DeNghiThanhToanChiTietUpdateInput;
	orderBy?: Prisma.DeNghiThanhToanOrderByWithRelationInput | Prisma.DeNghiThanhToanOrderByWithRelationInput[] | unknown;
	include?: IQueryPaymentDetail;
	where?: IPaymentDetailWhere;
}

export interface IPaymentDetailResponse {
	metadata: object;
	version: number;
	id: string;
	DeNghiThanhToan?: IPaymentResponse;
	id_deNghiThanhToan: string;
	soChungTuThanhToan: string;
	loaiChungTuThanhToan: string;
	ChiTietDonBanHang?: ISellDetailResponse;
	soLuong?: string;
	id_PurchaseOrderlines: string[];
	is_fee: boolean | null;
	thanhTien: string;
	donGia: string;
	soTienCanThanhToan: string;
	thanhTienTruocThue: string;
	CreatedBy?: IUserResponse;
	createdBy: string;
	UpdatedBy?: IUserResponse;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	total?: number;
}