import HeaderPageLayout from '@/components/layout/HeaderPage'
import Order from '@/components/modal/purchase/order'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { SellPurchaseColumns } from '@/components/table/sell/column-sell-purchase'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs'
import { useGetSellDetailByCodes } from '@/hooks/use-sell'
import { ISellDetailResponse } from '@/types/sell'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

export const Route = createLazyFileRoute('/_app/purchase/$sellId')({
  component: PurchaseNewPage,
})

function PurchaseNewPage() {
  const { sellId } = useParams({ strict: false })

  const { mutateAsync, data } = useGetSellDetailByCodes()

  useEffect(() => {
    const ids = sellId?.split(',')

    if (ids) {
      mutateAsync(ids)
    }
  }, [])

  return (
    <div>
      <HeaderPageLayout title="Đơn mua hàng" buttonSubmit={<div />} />

      <div className="mt-4">
        <Tabs defaultValue="order">
          <TabsList>
            <TabsTrigger value="order">Đơn bán hàng</TabsTrigger>
            <TabsTrigger value="purchase">Đơn mua hàng</TabsTrigger>
          </TabsList>
          <TabsContent value="order">
            <OrderTab data={data?.results} />
          </TabsContent>
          <TabsContent value="purchase">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface OrderTabProps {
  data: ISellDetailResponse[] | undefined
}

const OrderTab = ({ data }: OrderTabProps) => {
  const [rowSelection, setRowSelection] = useState<ISellDetailResponse[]>([])


  const listTools = useMemo(() => {
    console.log('rowSelection', rowSelection)

    return (
      <div>
        <Order data={rowSelection || []} />
      </div>
    )
  }, [rowSelection])

  const handleSelect = (rowSelection: Record<string, boolean>) => {
    const index = Object.keys(rowSelection).map((key) => parseInt(key))
    const tmp = index.map((item) => data?.[item]) as ISellDetailResponse[]

    setRowSelection(tmp)
  }

  return (
    <div className="w-full">
      <Card>
        <CardContent className="my-4">
          <DataTableDetail rowSelect={handleSelect} listTools={listTools} columns={SellPurchaseColumns} data={data || []} />
        </CardContent>
      </Card>
    </div>
  )
}
