import { DataTable } from '@/components/table/data-table'
import { UserColumns } from '@/components/table/user/columns'
import { Button } from '@/components/ui/button'
import { useGetUsers } from '@/hooks/use-user'
import { hasPermission, PERMISSION_CODES } from '@/lib/permissions'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/user/')({
  component: UserPage,
})

function UserPage() {
  const navigate = useNavigate()
  const { mutateAsync, data, isPending } = useGetUsers()
  const canCreate = hasPermission(PERMISSION_CODES.USER_CREATE)
  const canManageRoles = hasPermission(PERMISSION_CODES.USER_UPDATE)

  const queryAllUsers = async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync({ ...req, search: JSON.stringify(req?.search) })
  }

  const listTools = useMemo(() => {
    if (!canCreate && !canManageRoles) return null
    return (
      <div className="flex gap-2">
        {canManageRoles && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/user/roles' })}
          >
            Quản lý vai trò
          </Button>
        )}
        {canCreate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/user/new' })}
          >
            Tạo mới
          </Button>
        )}
      </div>
    )
  }, [canCreate, canManageRoles, navigate])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllUsers(req as IRequestPaginationAndSearch)}
        total={data?.data?.pagination?.total}
        title="DANH SÁCH USER"
        isLoading={isPending}
        data={
          data?.data?.data?.map((item) => ({
            ...item,
            refetch: queryAllUsers,
          })) || []
        }
        columns={UserColumns}
      />
      <Outlet />
    </div>
  )
}
