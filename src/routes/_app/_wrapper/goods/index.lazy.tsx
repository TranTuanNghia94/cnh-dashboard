import { DataTable } from '@/components/table/data-table'
import { ProductColumns } from '@/components/table/product/columns'
import { Button } from '@/components/ui/button'
import { UploadProductModal } from '@/components/modal/product/upload'
import { useGetProducts } from '@/hooks/use-product'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  createLazyFileRoute,
  Outlet,
  useNavigate,
} from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/goods/')({
  component: ProductPage,
})

function ProductPage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetProducts()

  const queryAllProducts = async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync(req)
  }

  const listTools = useMemo(() => {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ to: '/goods/new' })}
        >
          Tạo mới
        </Button>

        <UploadProductModal 
          onUploadSuccess={() => {}}
        />
      </div>
    )
  }, [])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) =>
          queryAllProducts(req as IRequestPaginationAndSearch)
        }
        total={data?.data?.pagination?.total}
        title="DANH SÁCH HÀNG HOÁ"
        data={
          data?.data?.data?.map((item) => ({
            ...item,
            refetch: () => queryAllProducts({ page: 0, limit: 10 }),
          })) || []
        }
        columns={ProductColumns}
      />
      <Outlet />
    </div>
  )
}
