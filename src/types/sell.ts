import { IAddressResponse, ICustomerResponse } from "./customer";
import { IGoodsResponse } from "./goods";
import { IPaymentRequest } from "./payment";
import { IPurchaseDetailResponse } from "./purchase";
import { Prisma } from "./schema";
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

export interface IQuerySell extends Prisma.DonHangSelect {}

export interface ISellWhere extends Prisma.DonHangWhereInput {}

export interface ISellResponse {
  metadata?: object;
  version?: number;
  id: string;
  orderNumber: string;
  maKhachHang?: string;
  KhachHang?: ICustomerResponse;
  soHopDong?: string;
  ngayTao?: Date | string;
  hanThanhToan?: Date | string;
  ngayHoanThanh?: Date | null;
  DeNghiThanhToan?: IPaymentRequest[];
  thanhTien?: string;
  thanhTienTruocThue?: string;
  LienHeGiaoHang?: IAddressResponse;
  ChiTietDonHang_s?: ISellDetailResponse[];
  CreatedBy?: IUserResponse;
  createdBy?: string;
  UpdatedBy?: IUserResponse;
  status?:
    | "DRAFT"
    | "OPEN"
    | "CLOSED_PURCHASING"
    | "CLOSED_FOR_INVOICING"
    | "CLOSED_FOR_SHIPPING"
    | "CLOSED_COMPLETE"
    | "CANCELLED"
    | string;
  i_status?: string;
  updatedBy?: string;
  ghiChu?: string[];
  createdAt?: Date | string;
  updatedAt?: Date;
  deletedAt?: Date;
  checked?: boolean;
}

export interface ISellInput extends Prisma.DonHangCreateInput {}

export interface ISellUpdate extends Prisma.DonHangUpdateInput {}

export interface ISellRequest {
  select?: IQuerySell;
  take?: number | undefined;
  skip?: number | undefined;
  where?: ISellWhere | unknown;
  include?: Prisma.DonHangInclude;
  orderBy?:
    | Prisma.DonHangOrderByWithRelationInput
    | Prisma.DonHangOrderByWithRelationInput[]
    | unknown;
  data?: ISellInput | Prisma.DonHangUpdateInput;
}

export interface IQuerySellDetail extends Prisma.DonHangChiTietSelect {}

export interface ISellDetailWhere extends Prisma.DonHangChiTietWhereInput {}

export interface ISellDetailInput extends Prisma.DonHangChiTietCreateInput {}

export interface ISellDetailRequest {
  select?: IQuerySellDetail;
  take?: number | undefined;
  skip?: number | undefined;
  where?: ISellDetailWhere;
  include?: IQuerySellDetail;
  orderBy?:
    | Prisma.DonHangChiTietOrderByWithRelationInput
    | Prisma.DonHangChiTietOrderByWithRelationInput[]
    | unknown;
  data?: ISellDetailInput;
}

export interface ISellDetailResponse {
  metadata?: object;
  version?: number;
  id?: string;
  DonHang?: ISellResponse;
  orderNumber?: string;
  ChiTietDonMuaHang_s?: IPurchaseDetailResponse[];
  HangHoa?: IGoodsResponse;
  id_HangHoa?: string;
  NhaCungCap?: IVendorResponse;
  maNhaCungCap?: string;
  soLuong?: string;
  donViTinh?: string;
  donViTinh_2?: string;
  donGia?: string;
  thanhTien?: string;
  thue?: string;
  daBaoGomThue?: boolean;
  giaoVien?: string;
  dept_room?: string;
  i_quote?: string;
  i_invoice?: string;
  i_billOfLanding?: string;
  i_receiptWarehouse?: string;
  i_trackId?: string;
  cust_maHangHoa?: string;
  cust_tenHangHoa?: string;
  cust_vendorCode?: string;
  cust_vendorName?: string;
  CreatedBy?: IUserResponse;
  createdBy?: string;
  UpdatedBy?: IUserResponse;
  updatedBy?: string;
  ghiChu?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  ref?: string;
  // ChiTietNhapKho?: IChiTietNhapKhoResponse[]
}

export interface ISellFileExcel {
  NO: number;
  "MA KHACH HANG": string;
  "SO HOP DONG": string;
  "NGAY PO": string;
  DEADLINE: string;
  "REF #": string;
  "MA HANG CUSTOMER": string;
  "TEN HANG": string;
  "LOAI HANG": string;
  LINK: string;
  VENDOR: string;
  "DON VI TINH 1": string;
  "SL BAN": number;
  "DON GIA BAN": string;
  "THANH TIEN": string;
  "THUE SUAT BAN": string;
  "DA GOM THUE (Y/N) BAN": string;
  "GIAO VIEN": string;
  DEPT: string;
  "GHI CHU CHI TIET": string;
}
