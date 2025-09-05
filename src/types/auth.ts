export interface IUserAuth {
  email: string;
  password: string;
}

export interface IAuth {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;
  username: string;
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
  fullname: string;
  roles: string[];
}
