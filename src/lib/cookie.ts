import Cookies from 'js-cookie';

export const TOKEN = 'token';
export const REFRESH_TOKEN = 'refreshToken';
export const SCOPES = 'scopes';
export const EXP = 'exp';
export const SUB = 'sub';
export const LANG = 'lang';
export const USER = 'user';
export const ROLES = 'roles';
export const SYS_CHOICES = 'sysChoices';
export const EMAIL = 'email';

export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => {
	Cookies.set(name, value, options);
};

export const getCookie = (name: string) => {
	return Cookies.get(name);
};

export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
	Cookies.remove(name, options);
};

export const removeAllCookies = () => {
	const allCookies = Cookies.get();
	for (const cookie in allCookies) {
		Cookies.remove(cookie);
	}
};

export const setCookieParseJson = (name: string, value: unknown, options?: Cookies.CookieAttributes) => {
	setCookie(name, JSON.stringify(value), options);
};

export const getCookieParseJson = (name: string) => {
	const cookie = getCookie(name);
	if (cookie) {
		return JSON.parse(cookie);
	}
	return null;
};

export const getRolesFromCookie = () => {
	const roles = getCookieParseJson(ROLES);
	if (roles) {
		return roles;
	}
	return [];
};
