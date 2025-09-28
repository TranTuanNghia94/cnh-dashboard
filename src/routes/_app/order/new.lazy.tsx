import HeaderPageLayout from '@/components/layout/HeaderPage'
import OrderLineCreate from '@/components/modal/order/order-line-create'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { OrderLineColumns } from '@/components/table/order/columns-order-line'
import CalendarPicker from '@/components/ui/calendar-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateOrder } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { IOrderCreateRequest, IOrderLineCreateRequest } from '@/types/order'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/order/new')({
  component: NewOrderPage,
})


function NewOrderPage() {
  const { mutateAsync, isSuccess, data } = useCreateOrder()
  const { toast } = useToast()
  const { history } = useRouter()
  const [listLines, setListLines] = useState<IOrderLineCreateRequest[]>([])

  useEffect(() => {
    if (data && isSuccess) {
      toast({
        title: 'Thao tác thành công',
        description: 'Tạo nhà cung cấp thành công',
        variant: 'success',
      })

      history.back()
    }
  }, [isSuccess, data])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const orderData: IOrderCreateRequest = {
      orderNumber: formData.get('orderNumber')?.toString().trim() as string,
      customerId: formData.get('customerId')?.toString().trim() as string,
      customerAddressId: formData.get('customerAddressId')?.toString().trim() as string,
      contractNumber: formData.get('contractNumber')?.toString().trim() as string,
      orderDate: formData.get('orderDate')?.toString().trim() as string,
      deliveryDate: formData.get('deliveryDate')?.toString().trim() as string,
      status: formData.get('status')?.toString().trim() as string,
      notes: formData.get('notes')?.toString().trim() as string,
      totalAmount: Number(formData.get('totalAmount')?.toString().trim()) as number,
      discountAmount: Number(formData.get('discountAmount')?.toString().trim()) as number,
      taxAmount: Number(formData.get('taxAmount')?.toString().trim()) as number,
      finalAmount: Number(formData.get('finalAmount')?.toString().trim()) as number,
      orderLines: listLines,
    }

    await mutateAsync(orderData)
  }

  const handleAddOrderLine = (val: IOrderLineCreateRequest) => {
    setListLines([...listLines, val])
  }

  const handleDeleteOrderLine = (index: number) => {
    setListLines(listLines.filter((_, i) => i !== index))
  }

  const handleUpdateOrderLine = (index: number, val: IOrderLineCreateRequest) => {
    setListLines(listLines.map((item, i) => i === index ? val : item))
  }

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>(undefined)


  return (
    <div>
      <HeaderPageLayout idForm="formCreateOrder" title="Thêm đơn hàng" />

      <div className="col-span-4 grid grid-cols-2 gap-x-4">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent >
            <form id="formCreateVendor" onSubmit={onSubmit} className="grid grid-cols-2 gap-x-4">
              <div>
                <Label className="text-xs" htmlFor="contractNumber">Số hợp đồng<span className="text-red-600">*</span></Label>
                <Input name="contractNumber" required className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="orderDate">Ngày lập hợp đồng<span className="text-red-600">*</span></Label>
                <CalendarPicker date={date} setDate={setDate} placeholder="Chọn ngày lập hợp đồng" />
              </div>

              <div className='mt-2'>
                <Label className="text-xs" htmlFor="customerId">Khách hàng<span className="text-red-600">*</span></Label>
                <Input name="customerId" required className="col-span-2" />
              </div>

              <div className='mt-2'>
                <Label className="text-xs" htmlFor="deliveryDate">Ngày giao dự kiến<span className="text-red-600">*</span></Label>
                <CalendarPicker date={dateDelivery} setDate={setDateDelivery} placeholder="Chọn ngày giao hàng" />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent >
            <form id="formCreateVendor" onSubmit={onSubmit} className="grid grid-cols-2 gap-x-4">
              <div>
                <Label className="text-xs" htmlFor="customerId">Người nhận<span className="text-red-600">*</span></Label>
                <Input name="customerId" required className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="customerId">SĐT<span className="text-red-600">*</span></Label>
                <Input name="customerId" required className="col-span-2" type="tel" />
              </div>

              <div className='col-span-2 mt-2'>
                <Label className="text-xs" htmlFor="contractNumber">Địa chỉ<span className="text-red-600">*</span></Label>
                <Input name="contractNumber" required className="col-span-2" />
              </div>

              <div className='col-span-2 mt-2'>
                <Label className="text-xs" htmlFor="orderDate">Ghi chú<span className="text-red-600">*</span></Label>
                <Input name="orderDate" required className="col-span-2" />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>


      <div className="col-span-8 mt-4">
        <Card>
          <CardContent>
            <div className="mt-4">
              <DataTableDetail listTools={<OrderLineCreate saveDetail={handleAddOrderLine} />}
                data={listLines?.map((item, index) => ({
                  ...item,
                  deleteRow: () => handleDeleteOrderLine(index),
                  updateRow: (val: IOrderLineCreateRequest) => handleUpdateOrderLine(index, val)
                }))}
                wrapperClassName='h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]'
                columns={OrderLineColumns}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}