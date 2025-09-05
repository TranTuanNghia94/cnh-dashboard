import { ICustomerResponse } from "./customer";
import { IGoodsResponse } from "./goods";
import { IMediasResponse } from "./media";
import { IPurchaseDetailResponse } from "./purchase";
import { Prisma } from "./schema";
import { ISellDetailResponse, ISellResponse } from "./sell";
import { IUserResponse } from "./user";
import { IVendorResponse } from "./vendor";
import { IWarehouseResponse } from "./warehouse";


export type IQueryNhapKho = Prisma.NhapKhoSelect
export type INhapKhoWhere = Prisma.NhapKhoWhereInput
export type INhapKhoInput = Prisma.NhapKhoCreateInput
export type INhapKhoUpdate = Prisma.NhapKhoUpdateInput

export interface INhapKhoRequest {
	select?: IQueryNhapKho;
	take?: number;
	skip?: number;
	orderBy?: Prisma.NhapKhoOrderByWithRelationInput | Prisma.NhapKhoOrderByWithRelationInput[];
	include?: Prisma.NhapKhoInclude;
	where?: INhapKhoWhere;
	data?: INhapKhoInput | INhapKhoInput[] | Prisma.DeNghiThanhToanUpdateInput | INhapKhoUpdate;
}

export interface INhapKhoResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	soPhieuNhap: string;
	ngayNhapKho: string | null;
	ChiTietNhapKho?: IChiTietNhapKhoResponse[];
	ghiChu: string[];
	Kho?: IWarehouseResponse | null;
	id_Kho: string | null;
	tyGia: number | null;
	CreatedBy?: IUserResponse | null;
	createdBy: string | null;
	UpdatedBy?: IUserResponse | null;
	updatedBy: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
	NhaCungCap?: IVendorResponse | null;
	Uploaded_ImportDocument?: IMediasResponse[]
	KhachHang?: ICustomerResponse | null;
	status?: string | null;
	reason?: string | null;
	DonHang?: ISellResponse | null;
	approvedBy?: IUserResponse | null;
	approvedTime?: string | Date | null;
	ChiPhi?: unknown[]
	totalPrice?: number
	totalIncludeTax?: number
}


export type IQueryChiTietNhapKho = Prisma.ChiTietNhapKhoSelect
export type IChiTietNhapKhoWhere = Prisma.ChiTietNhapKhoWhereInput
export type IChiTietNhapKhoInput = Prisma.ChiTietNhapKhoCreateInput
export interface INhapKhoChiTietInput extends Prisma.ChiTietNhapKhoCreateInput {
	ghiChu?: string[] 
}
export type IChiTietNhapKhoUpdate = Prisma.ChiTietNhapKhoUpdateWithWhereUniqueWithoutNhapKhoInput

export interface IChiTietNhapKhoRequest {
	select?: IQueryChiTietNhapKho;
	take?: number;
	skip?: number;
	orderBy?: Prisma.ChiTietNhapKhoOrderByWithRelationInput | Prisma.ChiTietNhapKhoOrderByWithRelationInput[];
	include?: IQueryChiTietNhapKho;
	where?: IChiTietNhapKhoWhere;
	data?: IChiTietNhapKhoInput | IChiTietNhapKhoInput[] | Prisma.DeNghiThanhToanUpdateInput;
}

export interface IChiTietNhapKhoResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	HangHoa?: IGoodsResponse;
	id_HangHoa: string;
	KhachHang?: ICustomerResponse | null;
	id_KhachHang: string | null;
	NhaCungCap?: IVendorResponse | null;
	id_NhaCungCap: string | null;
	DonHang?: ISellResponse | null;
	id_DonHang: string | null;
	soPO: string | null;
	moTa: string | null;
	donViTinh: string | null;
	soLuong: number;
	thue: number | null;
	tienThue: number | null;
	donGia: number | null;
	thanhTien: number | null;
	tienTe: string | null;
	tyGia: number | null;
	invoice: string | null;
	bill: string | null;
	billSoSach: string | null;
	NhapKho?: INhapKhoResponse;
	DonMuaHangChiTiet?: IPurchaseDetailResponse | null;
	DonHangChiTiet?: ISellDetailResponse | null;
	id_NhapKho: string;
	ghiChu: string[];
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}