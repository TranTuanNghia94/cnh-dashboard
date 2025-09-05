import { Prisma } from "./schema";

export interface IUserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  isActive: boolean;
}

export interface IRolesResponse {
  metadata?: string;
  version?: number;
  id?: string;
  name?: string;
  displayName?: string;
  description?: string;
  isSystemUsage?: false;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
}

export interface IAclResponse {
  metadata?: object;
  version: number;
  id: string;
  name: string;
  displayName?: string;
  groupName?: string;
  groupDescription?: string;
  description?: string;
  Assignments: IAssignmentRes[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IAssignmentRes {
  metadata?: object;
  version: number;
  id: string;
  User?: IUserResponse;
  userId?: string;
  AssignedACLItems: IAclResponse[];
  Roles: IRolesResponse[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type IQueryUser = Prisma.UserSelect;

export type IUserInput = Prisma.UserCreateInput;

export type IUserUpdateInput = Prisma.UserUpdateInput;

export type IUserWhere = Prisma.UserWhereInput;

export interface IUserRequest {
	select?: IQueryUser;
	include?: IQueryUser;
	where?: IUserWhere;
	take?: number;
	skip?: number;
	data?: IUserInput | IUserUpdateInput;
  orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] | unknown;
}

export interface IRolesResponse {
	metadata?: string;
	version?: number;
	id?: string;
	name?: string;
	displayName?: string;
	description?: string;
	isSystemUsage?: false;
	createdAt?: Date | string | null;
	updatedAt?: Date | string | null;
	deletedAt?: Date | string | null;
}

export interface IUserRoles {
	roles: IRolesResponse;
	undoDefault: boolean;
	default?: boolean;
}