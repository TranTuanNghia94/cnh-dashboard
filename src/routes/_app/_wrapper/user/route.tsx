import { canAccessUserManagementScreens } from '@/lib/user-route-access'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_wrapper/user')({
	beforeLoad: () => {
		if (!canAccessUserManagementScreens()) {
			throw redirect({ to: '/home', replace: true })
		}
	},
	component: () => <Outlet />,
})
