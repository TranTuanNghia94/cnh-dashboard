import Cookies from 'js-cookie';

export const TOKEN = 'token';
export const REFRESH_TOKEN = 'refreshToken';
export const SCOPES = 'scopes';
export const EXP = 'exp';
export const SUB = 'sub';
export const LANG = 'lang';
export const USER = 'user';
export const ROLES = 'roles';
export const PERMISSIONS = 'permissions';
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

export const getCookieParseJson = (name: string): unknown | null => {
	const cookie = getCookie(name);
	if (cookie == null || cookie === '' || cookie === 'undefined') {
		return null;
	}
	try {
		return JSON.parse(cookie) as unknown;
	} catch {
		return null;
	}
};

export const getRolesFromCookie = (): string[] => {
	const roles = getCookieParseJson(ROLES);
	if (Array.isArray(roles)) {
		return roles.filter((r): r is string => typeof r === 'string');
	}
	return [];
};

export const getPermissionsFromCookie = (): string[] => {
	const permissions = getCookieParseJson(PERMISSIONS);
	if (Array.isArray(permissions)) {
		return permissions
			.map((permission) => {
				if (typeof permission === 'string') return permission;
				if (permission && typeof permission === 'object' && 'code' in permission) {
					const code = (permission as { code?: unknown }).code;
					return typeof code === 'string' ? code : null;
				}
				return null;
			})
			.filter((p): p is string => typeof p === 'string' && p.length > 0);
	}
	return [];
};
