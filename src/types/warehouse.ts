import { Prisma } from "./schema";  
import { IUserResponse } from "./user";


export type IQueryWarehouse = Prisma.WarehouseSelect
export type IWarehouseWhere = Prisma.WarehouseWhereInput
export type IWarehouseInput = Prisma.WarehouseCreateInput

export interface IWarehouseRequest {
	select?: IQueryWarehouse;
	take?: number;
	skip?: number;
	orderBy?: Prisma.WarehouseOrderByWithRelationInput | Prisma.WarehouseOrderByWithRelationInput[];
	include?: IQueryWarehouse;
	where?: IWarehouseWhere;
	data?: IWarehouseInput | IWarehouseInput[] | Prisma.WarehouseUpdateInput;
}

export interface IWarehouseResponse {
	metadata: Prisma.JsonValue | null;
	version: number;
	id: string;
	tenKho: string;
	maKho: string;
	diaChi: string | null;
	CreatedBy?: IUserResponse | null;
	createdBy: string | null;
	UpdatedBy?: IUserResponse | null;
	updatedBy: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}