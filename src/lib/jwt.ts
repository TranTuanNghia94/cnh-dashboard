import { jwtDecode } from "jwt-decode";

export const decodeJwt = (token: string): unknown => {
  try {
    const decoded = jwtDecode(token);

    return decoded;
  } catch (error) {
    console.error(error);
    return error;
  }
};
