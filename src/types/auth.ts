export interface IUserAuth {
  email: string;
  password: string;
}

export interface IPermissionClaim {
  code: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface IAuth {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;
  username: string;
  permissions?: Array<string | IPermissionClaim>;
  passkeyRegistered?: boolean;
  passkeyRegistrationRequired?: boolean;
}

export interface IResourceScopes {
  user: string[];
  product: string[];
  order: string[];
  payment_request: string[];
  good_received_note: string[];
  good_delivery_note: string[];
  report: string[];
}

export interface JwtData {
  exp: number;
  email: string;
  sub: string;
  fullname?: string;
  fullName?: string;
  name?: string;
  roles: string[];
  permissions?: Array<string | IPermissionClaim>;
}
