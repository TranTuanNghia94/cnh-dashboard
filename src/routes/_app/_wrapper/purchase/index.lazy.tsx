import { DataTable } from '@/components/table/data-table'
import { PurchaseOrderColumns } from '@/components/table/purchase/column'
import { Button } from '@/components/ui/button'
import { useGetPurchases } from '@/hooks/use-purchase'
import { IRequestPaginationAndSearch } from '@/types/api'
import { IPurchaseOrderResponse } from '@/types/purchase'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/purchase/')({
  component: PurchasePage,
})

function PurchasePage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetPurchases()

  const queryAllPurchases = async (req?: IRequestPaginationAndSearch) => {
    await mutateAsync({ ...req })
  }

  const listTools = useMemo(() => {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate({ to: '/purchase/new' })}>Tạo mới</Button>
      </div>
    )
  }, [navigate])

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllPurchases(req as IRequestPaginationAndSearch)}
        total={data?.data?.pagination?.total}
        title="DANH SÁCH ĐƠN MUA HÀNG"
        data={data?.data?.data?.map((item: IPurchaseOrderResponse) => ({
          ...item,
          refetch: () => queryAllPurchases({ page: 0, limit: 10 }),
        })) || []}
        columns={PurchaseOrderColumns}
      />
    </div>
  )
}
