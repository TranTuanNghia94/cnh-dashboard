import { hasAnyPermission, USER_MANAGEMENT_PERMISSIONS } from '@/lib/permissions';
import type { AppNavItem } from '@/lib/list-routes';

export function canAccessUserManagementScreens(): boolean {
	return hasAnyPermission(USER_MANAGEMENT_PERMISSIONS);
}

export function isNavItemVisibleForUserScreen(item: AppNavItem): boolean {
	if (item.permissions?.length) return hasAnyPermission(item.permissions);
	if (item.gatedByUserAccess) return canAccessUserManagementScreens();
	return true;
}
