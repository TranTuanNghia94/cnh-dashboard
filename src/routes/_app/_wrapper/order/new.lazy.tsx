import HeaderPageLayout from '@/components/layout/HeaderPage'
import FindAddress from '@/components/modal/address/find'
import FindCustomer from '@/components/modal/customer/find'
import OrderLineCreate from '@/components/modal/order/order-line-create'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { OrderLineColumns } from '@/components/table/order/columns-order-line'
import CalendarPicker from '@/components/ui/calendar-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCreateOrder } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { IAddressResponse } from '@/types/address'
import { ICustomerResponse } from '@/types/customer'
import { IOrderCreateRequest, IOrderLineCreateRequest } from '@/types/order'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { CheckCircle2, Circle, RefreshCcw } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/order/new')({
  component: NewOrderPage,
})

function NewOrderPage() {
  const { mutateAsync, isSuccess, data, isPending } = useCreateOrder()
  const { toast } = useToast()
  const { history } = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [listLines, setListLines] = useState<IOrderLineCreateRequest[]>([])
  const [customerData, setCustomerData] = useState<ICustomerResponse>()

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>(undefined)
  const [addressData, setAddressData] = useState<IAddressResponse>()

  const finalAmount = useMemo(
    () => listLines.reduce((acc, item) => acc + item.totalAmount, 0),
    [listLines],
  )

  const canSubmit =
    !!customerData &&
    !!addressData &&
    !!date &&
    !!dateDelivery &&
    listLines.length > 0 &&
    !isPending

  const steps = useMemo(
    () => [
      {
        label: 'Chọn khách hàng',
        done: !!customerData,
        current: !customerData,
      },
      {
        label: 'Chọn địa chỉ giao hàng',
        done: !!customerData && !!addressData,
        current: !!customerData && !addressData,
      },
      {
        label: 'Thêm sản phẩm',
        done: listLines.length > 0,
        current: listLines.length === 0 && !!addressData,
      },
      {
        label: 'Xác nhận & lưu',
        done: canSubmit,
        current: canSubmit,
      },
    ],
    [customerData, addressData, listLines.length, canSubmit],
  )

  const summarySections = useMemo(
    () => [
      {
        label: 'Khách hàng',
        value: customerData?.name || 'Chưa chọn khách hàng',
        description: customerData?.code,
      },
      {
        label: 'Người nhận',
        value: addressData?.contactPerson || 'Chưa có thông tin',
        description: addressData?.phone,
      },
      {
        label: 'Địa chỉ giao hàng',
        value: addressData?.address || 'Chưa có thông tin',
        description: undefined,
      },
      {
        label: 'Tổng tiền tạm tính',
        value: `${finalAmount.toLocaleString('vi-VN')} đ`,
        description: listLines.length
          ? `${listLines.length} dòng sản phẩm`
          : 'Chưa có sản phẩm',
      },
    ],
    [customerData, addressData, finalAmount, listLines.length],
  )

  const handleResetForm = useCallback(() => {
    formRef.current?.reset()
    setCustomerData(undefined)
    setAddressData(undefined)
    setListLines([])
    setDate(undefined)
    setDateDelivery(undefined)
  }, [])

  useEffect(() => {
    if (data && isSuccess) {
      toast({
        title: 'Thao tác thành công',
        description: 'Tạo đơn hàng thành công',
        variant: 'success',
      })

      history.back()
    }
  }, [isSuccess, data, toast, history])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!canSubmit) return

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
      finalAmount,
      orderLines: listLines,
    }

    await mutateAsync(orderData)
  }

  const handleAddOrderLine = useCallback(
    (val: IOrderLineCreateRequest) => {
      setListLines((prev) => [...prev, val])
    },
    [],
  )

  const handleDeleteOrderLine = useCallback((index: number) => {
    setListLines((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateOrderLine = useCallback(
    (index: number, val: IOrderLineCreateRequest) => {
      setListLines((prev) => prev.map((item, i) => (i === index ? val : item)))
    },
    [],
  )

  const handleSelectCustomer = useCallback((data: ICustomerResponse) => {
    setCustomerData(data)
    setAddressData(undefined)
  }, [])

  const handleSelectAddress = useCallback((data: IAddressResponse) => {
    setAddressData(data)
  }, [])

  return (
    <div>
      <HeaderPageLayout
        idForm="formCreateOrder"
        title="Thêm đơn hàng"
        buttonSubmit={
          <Button
            type="submit"
            size="sm"
            form="formCreateOrder"
            disabled={!canSubmit}
          >
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        }
      />

      <div className="mt-4 rounded-md border bg-muted/50 p-4 ">
        <ol className="flex justify-around gap-4 text-xs font-medium text-muted-foreground">
          {steps.map((step) => (
            <li
              key={step.label}
              className="flex items-center gap-2"
              aria-current={step.current ? 'step' : undefined}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-foreground">{step.label}</span>
                <Badge
                  variant={
                    step.done ? 'success' : step.current ? 'warning' : 'outline'
                  }
                >
                  {step.done ? 'Hoàn tất' : step.current ? 'Đang thực hiện' : 'Chờ'}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <form
        id="formCreateOrder"
        onSubmit={onSubmit}
        ref={formRef}
        className="col-span-4 grid grid-cols-2 gap-4"
      >
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-x-6">
              <div className="col-span-3">
                <Label className="text-xs" htmlFor="contractNumber">
                  Số hợp đồng<span className="text-red-600">*</span>
                </Label>
                <Input
                  name="contractNumber"
                  placeholder="Nhập số hợp đồng"
                  required
                  className="col-span-2"
                />
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
                <Label className="text-xs" htmlFor="customerName">
                  Khách hàng<span className="text-red-600">*</span>
                </Label>
                <div className="flex gap-x-4">
                  <Input
                    id="customerName"
                    name="customerName"
                    disabled
                    className="col-span-2"
                    placeholder="Chưa chọn khách hàng"
                    value={customerData?.name || ''}
                  />
                  <FindCustomer handleSelect={handleSelectCustomer} />
                </div>
                {!customerData && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vui lòng chọn khách hàng để kích hoạt thông tin giao hàng.
                  </p>
                )}
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
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <Label className="text-xs" htmlFor="customerId">
                  Người nhận
                </Label>
                <div className="flex gap-x-4">
                  <Input
                    name="contactPerson"
                    className="col-span-2"
                    type="tel"
                    disabled
                    placeholder="Chưa có thông tin"
                    value={addressData?.contactPerson || ''}
                  />
                  <FindAddress
                    setAddressData={handleSelectAddress}
                    customerId={(customerData?.id as string) || null}
                    disabled={!customerData}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs" htmlFor="customerId">
                  SĐT
                </Label>
                <Input
                  name="contactPhone"
                  className="col-span-2"
                  type="tel"
                  disabled
                  placeholder="Chưa có thông tin"
                  value={addressData?.phone || ''}
                />
              </div>

              <div className="col-span-2 mt-2">
                <Label className="text-xs" htmlFor="contractNumber">
                  Địa chỉ giao hàng
                </Label>
                <Input
                  name="shippingAddress"
                  className="col-span-2"
                  disabled
                  placeholder="Chưa có thông tin"
                  value={addressData?.address || ''}
                />
              </div>

              <div className="col-span-2 mt-2">
                <Label className="text-xs" htmlFor="orderDate">
                  Ghi chú
                </Label>
                <Input name="notes" className="col-span-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 col-span-2">
          <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="uppercase">Tổng quan đơn hàng</CardTitle>
              <p className="text-xs text-muted-foreground">
                Kiểm tra nhanh các thông tin quan trọng trước khi lưu.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetForm}
              disabled={isPending}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới biểu mẫu
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summarySections.map((section) => (
                <div
                  key={section.label}
                  className="rounded-md border bg-muted/40 p-3 text-sm"
                >
                  <dt className="text-xs uppercase text-muted-foreground">
                    {section.label}
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {section.value}
                  </dd>
                  {section.description && (
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="col-span-2 mt-4">
          <Card>
            <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="uppercase">Chi tiết đơn hàng</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Tổng tiền hiện tại:{' '}
                  <span className="font-semibold text-primary">
                    {finalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </p>
              </div>
              {!canSubmit && (
                <p className="text-xs text-muted-foreground">
                  Thêm ít nhất một dòng sản phẩm và đủ thông tin để gửi đơn.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <DataTableDetail
                  listTools={
                    <OrderLineCreate
                      saveDetail={handleAddOrderLine}
                      disabled={!customerData}
                    />
                  }
                  data={listLines?.map((item, index) => ({
                    ...item,
                    deleteRow: () => handleDeleteOrderLine(index),
                    updateRow: (val: IOrderLineCreateRequest) =>
                      handleUpdateOrderLine(index, val),
                  }))}
                  wrapperClassName="h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]"
                  columns={OrderLineColumns}
                  noDataText="Chưa có sản phẩm nào, bấm 'Thêm sản phẩm' để bắt đầu."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
