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
  createdAt: Date;
  updatedAt: Date;
  roles: IRolesResponse[];
}

export interface IRolesResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: IPermissionsResponse[];
}

export interface IPermissionsResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  action: string;
  resource: string;
}

export interface ICreateUserInput {
  username: string;
  password: string;
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}
