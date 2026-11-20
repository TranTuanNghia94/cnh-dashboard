import { toast } from '@/hooks/use-toast'
import { canAccessUserManagementScreens } from '@/lib/user-route-access'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_wrapper/user')({
	beforeLoad: () => {
		if (!canAccessUserManagementScreens()) {
			toast({
				variant: 'warning',
				title: 'Không có quyền truy cập',
				description: 'Bạn không có quyền quản lý người dùng.',
			})
			throw redirect({ to: '/home', replace: true })
		}
	},
	component: () => <Outlet />,
})
