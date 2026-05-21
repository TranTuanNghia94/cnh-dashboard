import { QUERIES } from "@/lib/constants";
import { EMAIL, FULLNAME, getCookie, PERMISSIONS, REFRESH_TOKEN, removeAllCookies, ROLES, setCookie, SUB, TOKEN, USER } from "@/lib/cookie";
import { decodeJwt } from "@/lib/jwt";
import { login, logout } from "@/services/auth";
import { getMe } from "@/services/user";
import { IAuth, IUserAuth, JwtData } from "@/types";
import { IRolesResponse } from "@/types/user";
import {  useMutation, useQuery, } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { ERROR_CODE } from "@/lib/error-code";
import { IErrorResponse } from "@/types/api";
import { useNavigate } from "@tanstack/react-router";

const normalizePermissionCodes = (permissions: IRolesResponse["permissions"] = []) => {
    return permissions
        .map((permission) => permission.code)
        .filter((permission): permission is string => Boolean(permission));
};

const normalizeRoleCodes = (roles: JwtData["roles"] = []) => {
    return roles
        .map((role) => typeof role === "string" ? role : "")
        .filter((role): role is string => Boolean(role));
};

const getJwtFullName = (jwtData: JwtData) => {
    const claims = jwtData as JwtData & {
        fullName?: string;
        name?: string;
    };

    return claims.fullname || claims.fullName || claims.name;
};

const getPermissionCodesByUserRoles = (userRoles: IRolesResponse[], roleCodes: string[]) => {
    const roleCodeSet = new Set(roleCodes);
    const permissionCodes = new Set<string>();
    const roles = roleCodeSet.size > 0
        ? userRoles.filter((role) => roleCodeSet.has(role.code))
        : userRoles;

    roles.forEach((role) => {
        normalizePermissionCodes(role.permissions).forEach((permission) => {
            permissionCodes.add(permission);
        });
    });

    return Array.from(permissionCodes);
};

export const setAuthenAndAuthor = async (data: IAuth) => {
    // decode jwt
    const jwtData = decodeJwt(data.accessToken) as JwtData;
    const roles = normalizeRoleCodes(jwtData?.roles);

    const opt: Cookies.CookieAttributes = {
        expires: new Date(jwtData?.exp * 1000),
        // domain: process.env.NODE_ENV === "production"
        //     ? import.meta.env.VITE_DEV_URL
        //     : import.meta.env.VITE_DEV_URL
    };


    // set token to cookie
    setCookie(TOKEN, data.accessToken, opt);
    setCookie(REFRESH_TOKEN, data.refreshToken, opt);
    
    const userResponse = await getMe();
    const user = userResponse.data;
    const fullName = getJwtFullName(jwtData) || user?.fullName || data.username || jwtData?.email || jwtData?.sub;

    setCookie(SUB, jwtData?.sub, opt);
    setCookie(USER, fullName, opt);
    setCookie(FULLNAME, fullName, opt);
    setCookie(EMAIL, jwtData?.email, opt);
    setCookie(ROLES, JSON.stringify(roles), opt);

    const permissions = getPermissionCodesByUserRoles(user?.roles ?? [], roles);
    setCookie(PERMISSIONS, JSON.stringify(permissions), opt);
};

export const useLoginMutation = () => {
    const navigate = useNavigate()
    const mutation = useMutation({
        mutationKey: [QUERIES.LOGIN],
        mutationFn: async (payload: IUserAuth) => {
            const response = await login(payload);
            if (response?.data) {
                await setAuthenAndAuthor(response.data);
            }
            return response;
        },
        onError(error: IErrorResponse) {
            const errorMessage = ERROR_CODE[error?.errorCode as keyof typeof ERROR_CODE]?.message || "Có lỗi xảy ra khi đăng nhập";

            toast({
                variant: "destructive",
                title: "Lỗi đăng nhập",
                description: errorMessage,
            })
        },
        onSuccess(res) {
            if (res?.data) {
                navigate({ to: '/home', replace: true })
            }
        },
    })

    return mutation
}

export const useLogoutMutation = () => {
    const mutation = useMutation({
        mutationKey: [QUERIES.AUTH],
        mutationFn: async () => {
            await logout()
            removeAllCookies();
        },
        onSuccess: () => {
            window.location.href = '/login'
        },
    })

    return mutation
}


export function useAuthQuery() {
    return useQuery({
        queryKey: [QUERIES.AUTH],
        queryFn: () => getCookie(USER) ?? Promise.reject(new Error("Not authenticated")),
        initialData: getCookie(USER) ,
    })
}
