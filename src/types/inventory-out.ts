import { IGoodsResponse } from "./goods";
import { IQueryChiTietNhapKho } from "./inventory-in";
import { Prisma } from "./schema";
import { ISellResponse } from "./sell";
import { IUserResponse } from "./user";
import { IVendorResponse } from "./vendor";
import { IWarehouseResponse } from "./warehouse";


export type IQueryXuatKho = Prisma.XuatKhoSelect
export type IXuatKhoWhere = Prisma.XuatKhoWhereInput
export type IXuatKhoInput = Prisma.XuatKhoCreateInput
export type IXuatKhoUpdate = Prisma.XuatKhoUpdateInput

export interface IXuatKhoRequest {
	select?: IQueryXuatKho;
	take?: number;
	skip?: number;
	orderBy?: Prisma.XuatKhoOrderByWithRelationInput | Prisma.XuatKhoOrderByWithRelationInput[];
	include?: Prisma.XuatKhoInclude;
	where?: IXuatKhoWhere;
	data?: IXuatKhoInput | IXuatKhoInput[] | Prisma.DeNghiThanhToanUpdateInput;
}

export interface IXuatKhoResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	Kho?: IWarehouseResponse | null;
	id_Kho: string | null;
	soPhieuXuat: string;
	ngayXuatKho: Date | null;
	tongTien: Prisma.Decimal | null;
	moTa: string | null;
	soPO: string | null;
	ghiChu?: string[];
	status: string | null;
	ChiTietXuatKho?: IChiTietXuatKhoResponse[];
	DonHang?: ISellResponse | null;
	id_DonHang: string | null;
	CreatedBy?: IUserResponse | null;
	createdBy: string | null;
	UpdatedBy?: IUserResponse | null;
	updatedBy: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
	approvedBy?: IUserResponse | null;
	approvedTime?: string | Date | null;
	reason?: string | null;
}

export type IQueryChiTietXuatKho = Prisma.XuatKhoSelect
export type IXuatKhoChiTietInput = Prisma.ChiTietXuatKhoCreateInput
export type IChiTietXuatKhoWhere = Prisma.ChiTietXuatKhoWhereInput
export type IXuatKhoChiTietUpdate = Prisma.ChiTietXuatKhoUpdateWithWhereUniqueWithoutXuatKhoInput


export interface IChiTietXuatKhoRequest {
	select?: IQueryChiTietXuatKho;
	take?: number;
	skip?: number;
	orderBy?: Prisma.ChiTietXuatKhoOrderByWithRelationInput | Prisma.ChiTietXuatKhoOrderByWithRelationInput[];
	include?: IQueryChiTietNhapKho;
	where?: IChiTietXuatKhoWhere;
	data?: IXuatKhoChiTietInput | IXuatKhoChiTietInput[] | Prisma.ChiTietXuatKhoUpdateInput;
}

export interface IChiTietXuatKhoResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	HangHoa?: IGoodsResponse;
	id_HangHoa: string;
	moTa: string | null;	
	donViTinh: string | null;
	soLuong: number;
	donGia: number | null;
	thanhTien: number | null;
	tienTe: string | null;
	thue: number | null;
	tienThue: number | null;
	soPhieuNhap: string | null;
	box: string | null;
	NhaCungCap?: IVendorResponse | null;
	id_NhaCungCap: string | null;
	XuatKho?: IXuatKhoResponse;
	id_XuatKho?: string;
	ghiChu?: string[];
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}