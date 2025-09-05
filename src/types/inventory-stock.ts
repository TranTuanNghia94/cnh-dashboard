import { ICustomerResponse } from "./customer";
import { IGoodsResponse } from "./goods";
import { INhapKhoResponse } from "./inventory-in";
import { Prisma } from "./schema";
import { IVendorResponse } from "./vendor";
import { IWarehouseResponse } from "./warehouse";


export interface IProductSupplierResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	NhapKho?: INhapKhoResponse | null;
	id_NhapKho: string | null;
	NhaCungCap?: IVendorResponse | null;
	id_NhaCungCap: string | null;
	HangHoa?: IGoodsResponse | null;
	id_HangHoa: string | null;
	KhachHang?: ICustomerResponse | null;
	id_KhachHang: string | null;
	soPO: string | null;
	donViTinh: string | null;
	moTa: string | null;
	donGia: number | null;
	thanhTien: number | null;
	tienTe: string | null;
	tyGia: number | null;
	ngayNhapKho: Date | null;
	Inventory?: IInventoryStockResponse[];
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}

export type IQueryInventoryStock = Prisma.InventorySelect
export type IInventoryStockWhere = Prisma.InventoryWhereInput
export type IInventoryStockInput = Prisma.InventoryCreateInput

export interface IInventoryStockRequest {
	select?: IQueryInventoryStock;
	take?: number;
	skip?: number;
	orderBy?: Prisma.InventoryOrderByWithRelationInput | Prisma.InventoryOrderByWithRelationInput[] | unknown;
	include?: Prisma.InventoryInclude | Prisma.InventoryInclude[] | unknown;
	where?: IInventoryStockWhere;
	data?: IInventoryStockInput | IInventoryStockInput[]
}

export interface IInventoryStockResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	SanPhamNhaCungCap?: IProductSupplierResponse[] | undefined;
	id_SanPhamNhaCungCap: string | null;
	HangHoa?: IGoodsResponse | null;
	Kho?: IWarehouseResponse | null;
	id_Kho: string | null;
	soLuong: Prisma.Decimal;
	ghiChu: string[];
	donGia: number | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}
