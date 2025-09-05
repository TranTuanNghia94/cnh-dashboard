import { QUERIES } from "@/lib/constants";
import { EMAIL, getCookie, REFRESH_TOKEN, removeAllCookies, ROLES, setCookie, SUB, TOKEN, USER } from "@/lib/cookie";
import { decodeJwt } from "@/lib/jwt";
import { login } from "@/services/auth";
import { IAuth, IUserAuth, JwtData } from "@/types";
import {  useMutation, useQuery, } from "@tanstack/react-query";


export const setAuthenAndAuthor = (data: IAuth) => {
    // decode jwt
    const jwtData = decodeJwt(data.accessToken) as JwtData;

    const opt: Cookies.CookieAttributes = {
        expires: new Date(jwtData?.exp * 1000),
        // domain: process.env.NODE_ENV === "production"
        //     ? import.meta.env.VITE_DEV_URL
        //     : import.meta.env.VITE_DEV_URL
    };


    // set token to cookie
    setCookie(TOKEN, data.accessToken, opt);
    setCookie(REFRESH_TOKEN, data.refreshToken, opt);
    setCookie(SUB, jwtData?.sub, opt);
    setCookie(USER, jwtData?.fullname, opt);
    setCookie(EMAIL, jwtData?.email, opt);
    setCookie(ROLES, JSON.stringify(jwtData?.roles), opt);
};

export const useLoginMutation = () => {
    const mutation = useMutation({
        mutationKey: [QUERIES.LOGIN],
        mutationFn: async (payload: IUserAuth) => await login(payload),
        onError(error) {
            console.log("hook error", error);
        },
        onSuccess(res) {
            if (res?.data) {
                setAuthenAndAuthor(res.data);
            }
        },
    })

    return mutation
}

export const useLogoutMutation = () => {
    const mutation = useMutation({
        mutationKey: [QUERIES.AUTH],
        mutationFn: () => {
            removeAllCookies();

            return Promise.resolve();
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
