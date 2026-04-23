import { LIST_ROLES } from '@/lib/constants';
import { getPermissionsFromCookie, getRolesFromCookie } from '@/lib/cookie';
import type { AppNavItem } from '@/lib/list-routes';

/**
 * JWT permission is considered user-management related if it contains the word "user"
 * as its own token (e.g. user:read, CREATE_USER, sys_user:write).
 */
function permissionRelatesToUser(permission: string): boolean {
	const p = permission.trim();
	if (!p) return false;
	return /\buser\b/i.test(p);
}

/** ADMIN role, or any permission tied to the user resource from cookies. */
export function canAccessUserManagementScreens(): boolean {
	const roles = getRolesFromCookie();
	if (roles.includes(LIST_ROLES.ADMIN.code)) return true;
	return getPermissionsFromCookie().some(permissionRelatesToUser);
}

export function isNavItemVisibleForUserScreen(item: AppNavItem): boolean {
	if (!item.gatedByUserAccess) return true;
	return canAccessUserManagementScreens();
}
