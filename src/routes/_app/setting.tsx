import { toast } from '@/hooks/use-toast'
import { hasAnyPermission, USER_SELF_PERMISSIONS } from '@/lib/permissions'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/setting')({
	beforeLoad: () => {
		if (!hasAnyPermission(USER_SELF_PERMISSIONS)) {
			toast({
				variant: 'warning',
				title: 'Không có quyền truy cập',
				description: 'Bạn không có quyền mở trang cài đặt.',
			})
			throw redirect({ to: '/home', replace: true })
		}
	},
})
