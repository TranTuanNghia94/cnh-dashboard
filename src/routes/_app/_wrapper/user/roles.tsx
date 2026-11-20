import { toast } from '@/hooks/use-toast'
import { hasPermission, PERMISSION_CODES } from '@/lib/permissions'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_wrapper/user/roles')({
	beforeLoad: () => {
		if (!hasPermission(PERMISSION_CODES.USER_UPDATE)) {
			toast({
				variant: 'warning',
				title: 'Không có quyền truy cập',
				description: 'Cần quyền USER_UPDATE để quản lý vai trò và phân quyền.',
			})
			throw redirect({ to: '/user', replace: true })
		}
	},
})
