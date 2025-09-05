import { Prisma } from "./schema";
import { ISellDetailResponse } from "./sell";
import { ITypeGoodsResponse } from "./type";

export interface IQueryGoods extends Prisma.HangHoaSelect {}

export interface IGoodsWhere extends Prisma.HangHoaWhereInput {}

export interface IGoodsInput extends Prisma.HangHoaCreateInput {}

export interface IGoodsRequest {
  select?: IQueryGoods;
  take?: number;
  skip?: number;
  include?: IQueryGoods;
  orderBy?:
    | Prisma.HangHoaOrderByWithRelationInput
    | Prisma.HangHoaOrderByWithRelationInput[]
    | unknown;
  where?: IGoodsWhere;
  data?: IGoodsInput | IGoodsInput[];
}

export interface IGoodsResponse {
  metadata?: object;
  version?: number;
  id: string;
  maHangHoa?: string;
  maHangHoa_s?: string[];
  LoaiHang?: ITypeGoodsResponse;
  subCategories?: string[];
  tenHang?: string;
  moTa?: string;
  soLuongCoSan?: string;
  donGiaMua?: string;
  donGiaBan?: string;
  donViTinh?: string;
  donViTinh_2?: string;
  ghiChu?: string[];
  MISA_id?: string;
  ChiTietDonHang_s?: ISellDetailResponse[];
  // Inventory?: IInventoryResponse[];
  // ChiTietBaoGia_s?: IQuoteDetailRes[];
  // ChiTietDeNghiThanhToan_s?: any[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IGoodsValidate {
  maHangHoa?: string;
  tenHangHoa?: string;
  donViTinh?: string;
  loaiHang?: string;
  maNhaCungCap?: string;
  soHopDong?: string;
  ghiChu?: string;
}
