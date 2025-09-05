import { DataTable } from '@/components/table/data-table'
import { PurchasesColumns } from '@/components/table/purchase/column'
import { Button } from '@/components/ui/button'
import { useGetSells } from '@/hooks/use-sell'
import { IPaginationAndSearch } from '@/types/api'
import { ISellWhere } from '@/types/sell'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createLazyFileRoute('/_app/purchase/')({
  component: PurchasePage
})


function PurchasePage() {
  const navigate = useNavigate()
  const { mutateAsync, data } = useGetSells()

  const queryAllSells = async (req?: IPaginationAndSearch<ISellWhere>) => {
    await mutateAsync({
      search: {
        AND: [
          {
            i_status: {
              not: null
            },
          },
          {
            i_status: {
              not: {
                contains: 'Nháp'
              }
            }
          }
        ]
      },
      ...req,
    });
  }

  const listTools = useMemo(() => {
    return <div>
      <Button size="sm" variant="outline" onClick={() => navigate({ to: "/sell/new" })}>Mua hàng</Button>
    </div>
  }, [])

  return (
    <div>
      <DataTable listTools={listTools}
        fetchData={(req) => queryAllSells(req as IPaginationAndSearch<ISellWhere>)}
        total={data?.metadata?.total} title='DANH SÁCH ĐƠN HÀNG' 
        data={data?.results?.map((item) => ({ ...item, refetch: queryAllSells })) || []} 
        columns={PurchasesColumns} />
    </div>
  )
}