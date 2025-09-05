import HeaderPageLayout from '@/components/layout/HeaderPage'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { InventoryInDetailColumns } from '@/components/table/inventory-in/columns-details'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useGetInventoryInDetail } from '@/hooks/use-inventory-in'
import { numberWithCommas } from '@/lib/other'
import { INhapKhoResponse } from '@/types/inventory-in'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/inventory-in/$inventoryCode')({
  component: InventoryInDetailPage
})

function InventoryInDetailPage() {
  const { inventoryCode } = useParams({ strict: false })

  const { mutateAsync: getInventoryInDetail, data, isSuccess } = useGetInventoryInDetail()

  const [inventoryIn, setInventoryIn] = useState<INhapKhoResponse | null>(null)

  useEffect(() => {
    if (inventoryCode) {
      getInventoryInDetail(inventoryCode)
    }
  }, [inventoryCode])


  useEffect(() => {
    if (isSuccess && data.results) {
      setInventoryIn(data.results[0])
    }
  }, [isSuccess, data])

  return (
    <div>
      <HeaderPageLayout idForm="inventoryInDetailForm" title="Chi tiết nhập kho" />
      <div className="grid grid-cols-8 gap-4 mt-4">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex gap-2 justify-between items-center">
                <div>
                  <Badge variant="success">{inventoryIn?.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  người duyệt: {inventoryIn?.approvedBy?.fullname}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center">
                <Label>Số phiếu:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{inventoryIn?.soPhieuNhap}</Badge>
                </div>
              </div>

              <div className="flex gap-2 items-center my-3">
                <Label>Người tạo:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{inventoryIn?.CreatedBy?.fullname}</Badge>
                </div>
              </div>

              <div className="flex gap-2 items-center my-3">
                <Label>Ngày nhập:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{moment(inventoryIn?.createdAt).format('DD/MM/YYYY')}</Badge>
                </div>
              </div>


              <div className="flex gap-2 items-center my-3">
                <Label>Kho:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{inventoryIn?.Kho?.maKho}</Badge>
                </div>
              </div>

              <div className="flex gap-2 items-center my-3">
                <Label>Nhà cung cấp:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{inventoryIn?.ChiTietNhapKho?.[0]?.NhaCungCap?.maNhaCungCap}</Badge>
                </div>
              </div>

              <div className="flex gap-2 items-center my-3">
                <Label>Số Invoice:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{inventoryIn?.ChiTietNhapKho?.[0]?.DonMuaHangChiTiet?.i_invoice}</Badge>
                </div>
              </div>

              <div className="flex gap-2 items-center my-3">
                <Label>Số Bill:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{inventoryIn?.ChiTietNhapKho?.[0]?.DonMuaHangChiTiet?.i_billOfLanding}</Badge>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Label>Tỷ giá:</Label>
                <div className="text-sm">
                  <Badge variant="outline">{numberWithCommas(Number(inventoryIn?.tyGia))}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-6">
          <Card>
            <CardContent className="mt-4">
              <DataTableDetail
                listTools={null}
                data={inventoryIn?.ChiTietNhapKho || []}
                wrapperClassName='h-[calc(85vh-175px)] max-h-[calc(85vh-175px)]'
                columns={InventoryInDetailColumns} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
