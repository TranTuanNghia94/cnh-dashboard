import { DataTable } from '@/components/table/data-table'
import { VendorColumns } from '@/components/table/vendor/columns'
import { Button } from '@/components/ui/button'
import { useGetVendors } from '@/hooks/use-vendor'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useMemo } from 'react'
import { UploadVendorModal } from '@/components/modal/vendor/upload'

export const Route = createLazyFileRoute('/_app/_wrapper/vendor/')({
  component: VendorPage,
})

function VendorPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetVendors()

  const queryAllVendors = async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync({ ...req })
  }

  const listTools = useMemo(() => {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: '/vendor/new' })}
        >
          Tạo mới
        </Button>
        <Button size="sm" variant="outline">
          Xuất file
        </Button>
        <UploadVendorModal onUploadSuccess={() => queryAllVendors({ page: 0, limit: 10 })} />
      </div>
    )
  }, [])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllVendors(req as IRequestPaginationAndSearch)}
        total={data?.data.pagination?.total}
        title="DANH SÁCH NHÀ CUNG CẤP"
        data={
          data?.data.data?.map((item) => ({
            ...item,
            refetch: () => queryAllVendors({ page: 0, limit: 10 }),
          })) || []
        }
        columns={VendorColumns}
      />
      <Outlet />
    </div>
  )
}
