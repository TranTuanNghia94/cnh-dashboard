import HeaderPageLayout from '@/components/layout/HeaderPage'
import FindAddress from '@/components/modal/address/find'
import FindCustomer from '@/components/modal/customer/find'
import OrderLineCreate from '@/components/modal/order/order-line-create'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { OrderLineColumns } from '@/components/table/order/columns-order-line'
import CalendarPicker from '@/components/ui/calendar-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateOrder } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { IAddressResponse } from '@/types/address'
import { ICustomerResponse } from '@/types/customer'
import { IOrderCreateRequest, IOrderLineCreateRequest } from '@/types/order'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/order/new')({
  component: NewOrderPage,
})

function NewOrderPage() {
  const { mutateAsync, isSuccess, data } = useCreateOrder()
  const { toast } = useToast()
  const { history } = useRouter()
  const [listLines, setListLines] = useState<IOrderLineCreateRequest[]>([])
  const [customerData, setCustomerData] = useState<ICustomerResponse>()

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>(undefined)
  const [addressData, setAddressData] = useState<IAddressResponse>()

  useEffect(() => {
    if (data && isSuccess) {
      toast({
        title: 'Thao tác thành công',
        description: 'Tạo đơn hàng thành công',
        variant: 'success',
      })

      history.back()
    }
  }, [isSuccess, data])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (listLines.length === 0) {
      return
    }

    const formData = new FormData(e.currentTarget)
    const orderData: IOrderCreateRequest = {
      customerId: customerData?.id as string,
      customerAddressId: addressData?.id as string,
      contractNumber: formData
        .get('contractNumber')
        ?.toString()
        .trim() as string,
      orderDate: moment(date).format('YYYY-MM-DD') as string,
      deliveryDate: moment(dateDelivery).format('YYYY-MM-DD') as string,
      status: 'DRAFT',
      notes: formData.get('notes')?.toString().trim() as string,
      totalAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      finalAmount: listLines.reduce((acc, item) => acc + item.totalAmount, 0),
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

  const handleUpdateOrderLine = (
    index: number,
    val: IOrderLineCreateRequest,
  ) => {
    setListLines(listLines.map((item, i) => (i === index ? val : item)))
  }

  const handleSelectCustomer = (data: ICustomerResponse) => {
    setCustomerData(data)
  }

  const handleSelectAddress = (data: IAddressResponse) => {
    setAddressData(data)
  }

  return (
    <div>
      <HeaderPageLayout idForm="formCreateOrder" title="Thêm đơn hàng" />

      <div className="col-span-4 grid grid-cols-2 gap-x-4">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="formCreateOrder"
              onSubmit={onSubmit}
              className="grid grid-cols-5 gap-x-6"
            >
              <div className="col-span-3">
                <Label className="text-xs" htmlFor="contractNumber">
                  Số hợp đồng<span className="text-red-600">*</span>
                </Label>
                <Input name="contractNumber" required className="col-span-2" />
              </div>

              <div className="col-span-2">
                <Label className="text-xs" htmlFor="orderDate">
                  Ngày lập hợp đồng<span className="text-red-600">*</span>
                </Label>
                <CalendarPicker
                  date={date}
                  setDate={setDate}
                  placeholder="Chọn ngày lập hợp đồng"
                />
              </div>

              <div className="mt-2 col-span-3">
                <Label className="text-xs" htmlFor="customerId">
                  Khách hàng<span className="text-red-600">*</span>
                </Label>
                <div className="flex gap-x-4">
                  <Input
                    disabled
                    name="customerId"
                    required
                    className="col-span-2"
                    value={customerData?.name}
                  />
                  <FindCustomer handleSelect={handleSelectCustomer} />
                </div>
              </div>

              <div className="mt-2 col-span-2">
                <Label className="text-xs" htmlFor="deliveryDate">
                  Ngày giao dự kiến<span className="text-red-600">*</span>
                </Label>
                <CalendarPicker
                  date={dateDelivery}
                  setDate={setDateDelivery}
                  placeholder="Chọn ngày giao hàng"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="formCreateOrder" className="grid grid-cols-2 gap-x-4">
              <div>
                <Label className="text-xs" htmlFor="customerId">
                  Người nhận
                </Label>
                <div className="flex gap-x-4">
                  <Input
                    name="customerId"
                    required
                    className="col-span-2"
                    type="tel"
                    disabled
                    value={addressData?.contactPerson}
                  />
                  <FindAddress
                    setAddressData={handleSelectAddress}
                    customerId={(customerData?.id as string) || null}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs" htmlFor="customerId">
                  SĐT
                </Label>
                <Input
                  name="customerId"
                  required
                  className="col-span-2"
                  type="tel"
                  disabled
                  value={addressData?.phone}
                />
              </div>

              <div className="col-span-2 mt-2">
                <Label className="text-xs" htmlFor="contractNumber">
                  Địa chỉ giao hàng
                </Label>
                <Input
                  name="contractNumber"
                  required
                  className="col-span-2"
                  disabled
                  value={addressData?.address}
                />
              </div>

              <div className="col-span-2 mt-2">
                <Label className="text-xs" htmlFor="orderDate">
                  Ghi chú
                </Label>
                <Input name="notes" className="col-span-2" />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-8 mt-4">
        <Card>
          <CardContent>
            <div className="mt-4">
              <DataTableDetail
                listTools={<OrderLineCreate saveDetail={handleAddOrderLine} />}
                data={listLines?.map((item, index) => ({
                  ...item,
                  deleteRow: () => handleDeleteOrderLine(index),
                  updateRow: (val: IOrderLineCreateRequest) =>
                    handleUpdateOrderLine(index, val),
                }))}
                wrapperClassName="h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]"
                columns={OrderLineColumns}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
