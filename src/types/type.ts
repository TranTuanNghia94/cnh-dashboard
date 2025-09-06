import { Prisma } from "./schema";



export interface IQueryGroupOfGoods extends Prisma.HangHoaLoaiSelect {}

export interface IGroupOfGoodsRequest {
	select?: IQueryGroupOfGoods;
	take?: number;
	skip?: number;
	where?: IGroupOfGoodsWhere;
	orderBy?: Prisma.HangHoaLoaiOrderByWithRelationInput | Prisma.HangHoaLoaiOrderByWithRelationInput[] | unknown;
	data?: IGroupOfGoodsInput;
}

export interface IGroupOfGoodsWhere extends Prisma.HangHoaLoaiWhereInput {}

export interface IGroupOfGoodsInput extends Prisma.HangHoaLoaiCreateInput {}

export interface IGroupOfGoodsResponse {
	version?: number;
	id: string;
	ten: string;
	donViTinh: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
}



export interface ITypeGoodsResponse {
	metadata?: object;
	version?: number;
	id?: string;
	ten?: string;
	SubCategories?: ITypeGoodsResponse[];
	ParentCategory?: ITypeGoodsResponse;
	donViTinh?: string;
	HangHoa_s?: IGoodsResponse[];
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date;
}
