import HeaderPageLayout from '@/components/layout/HeaderPage'
import { OrderInfoForm, OrderLinesSection, OrderFooterBar } from '@/components/order/order-form-shared'
import OrderBatchUploadModal from '@/components/order/order-batch-upload-modal'
import { SectionStep } from '@/components/order/order-ui'
import { useCreateOrder } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { downloadBatchOrderExcelTemplate } from '@/lib/order-lines-excel'
import { IAddressResponse } from '@/types/address'
import { ICustomerResponse } from '@/types/customer'
import { IOrderLineCreateRequest } from '@/types/order'
import { formatCurrencyVN } from '@/lib/other'
import { createLazyFileRoute, useBlocker, useRouter } from '@tanstack/react-router'
import { MapPin, Package, ShoppingCart, User } from 'lucide-react'
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
  const [addressData, setAddressData] = useState<IAddressResponse>()
  const [date, setDate] = useState<Date | undefined>()
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>()

  const isDirty = !!customerData || !!addressData || listLines.length > 0 || !!date || !!dateDelivery

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: isDirty && !isSuccess,
  })

  const canSubmit = !!customerData && !!addressData && !!date && !!dateDelivery && listLines.length > 0 && !isPending

  useEffect(() => {
    if (data && isSuccess) {
      toast({ title: 'Thao tác thành công', description: 'Tạo đơn hàng thành công', variant: 'success' })
      history.back()
    }
  }, [isSuccess, data, toast, history])

  const handleSave = useCallback(async () => {
    if (!canSubmit || !formRef.current) return
    const formData = new FormData(formRef.current)
    const finalAmount = listLines.reduce((acc, l) => acc + l.totalAmount, 0)
    await mutateAsync({
      customerId: customerData!.id as string,
      customerAddressId: addressData!.id as string,
      contractNumber: formData.get('contractNumber')?.toString().trim() as string,
      orderDate: moment(date).format('YYYY-MM-DD'),
      deliveryDate: moment(dateDelivery).format('YYYY-MM-DD'),
      status: 'DRAFT',
      notes: formData.get('notes')?.toString().trim() as string,
      totalAmount: 0, discountAmount: 0, taxAmount: 0,
      finalAmount,
      orderLines: listLines,
    })
  }, [canSubmit, customerData, addressData, date, dateDelivery, listLines, mutateAsync])

  const handleResetForm = useCallback(() => {
    formRef.current?.reset()
    setCustomerData(undefined)
    setAddressData(undefined)
    setListLines([])
    setDate(undefined)
    setDateDelivery(undefined)
  }, [])

  const handleAddLine = useCallback((val: IOrderLineCreateRequest) =>
    setListLines(prev => [...prev, val]), [])

  const handleDeleteLine = useCallback((i: number) =>
    setListLines(prev => prev.filter((_, idx) => idx !== i)), [])

  const handleUpdateLine = useCallback((i: number, val: IOrderLineCreateRequest) =>
    setListLines(prev => prev.map((item, idx) => idx === i ? val : item)), [])

  const handleSelectCustomer = useCallback((data: ICustomerResponse) => {
    setCustomerData(data)
    setAddressData(undefined)
  }, [])

  const handleSelectAddress = useCallback((data: IAddressResponse) => setAddressData(data), [])

  const tableData = useMemo(
    () => listLines.map((item, i) => ({
      ...item,
      deleteRow: () => handleDeleteLine(i),
      updateRow: (val: IOrderLineCreateRequest) => handleUpdateLine(i, val),
    })),
    [listLines, handleDeleteLine, handleUpdateLine],
  )

  const stepItems = useMemo(() => [
    {
      icon: User,
      label: 'Chọn khách hàng',
      helper: customerData ? `${customerData.name} (${customerData.code})` : 'Chọn khách hàng để tiếp tục',
      state: (customerData ? 'done' : 'current') as 'done' | 'current' | 'pending',
    },
    {
      icon: MapPin,
      label: 'Chọn địa chỉ giao hàng',
      helper: addressData?.address ?? 'Chọn địa chỉ sau khi chọn khách hàng',
      state: (customerData && addressData ? 'done' : customerData ? 'current' : 'pending') as 'done' | 'current' | 'pending',
    },
    {
      icon: Package,
      label: 'Thêm sản phẩm',
      helper: listLines.length > 0 ? `${listLines.length} dòng sản phẩm` : 'Thêm ít nhất một dòng sản phẩm',
      state: (listLines.length > 0 ? 'done' : customerData && addressData ? 'current' : 'pending') as 'done' | 'current' | 'pending',
    },
    {
      icon: ShoppingCart,
      label: 'Xác nhận & lưu',
      helper: canSubmit ? 'Sẵn sàng tạo đơn hàng' : 'Hoàn tất các bước trên',
      state: (canSubmit ? 'done' : 'pending') as 'done' | 'current' | 'pending',
    },
  ], [customerData, addressData, listLines.length, canSubmit])

  const linesSectionHelper = listLines.length > 0
    ? `${listLines.length} dòng sản phẩm`
    : 'Thêm ít nhất một dòng để tạo đơn hàng'

  return (
    <div className="pb-28">
      <HeaderPageLayout title="Thêm đơn hàng" buttonSubmit={<></>} />

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stepItems.map(step => (
          <SectionStep key={step.label} icon={step.icon} label={step.label} helper={step.helper} state={step.state} />
        ))}
      </div>

      <OrderInfoForm
        formId="formCreateOrder"
        formRef={formRef}
        onSubmit={e => { e.preventDefault(); handleSave() }}
        date={date} setDate={setDate}
        dateDelivery={dateDelivery} setDateDelivery={setDateDelivery}
        customerData={customerData} onSelectCustomer={handleSelectCustomer}
        addressData={addressData} onSelectAddress={handleSelectAddress}
        className="mt-4"
      />

      <div className="mt-4">
        <OrderLinesSection
          listLines={listLines}
          tableData={tableData}
          formattedTotal={formatCurrencyVN(listLines.reduce((acc, l) => acc + l.totalAmount, 0))}
          linesSectionHelper={linesSectionHelper}
          onAddLine={handleAddLine}
          disableAddLine={!customerData}
          noDataText="Chưa có sản phẩm nào. Bấm 'Thêm mới' để bắt đầu."
          onReset={handleResetForm}
          isSaving={isPending}
          onDownloadTemplate={downloadBatchOrderExcelTemplate}
          uploadExcelAction={<OrderBatchUploadModal triggerLabel="Tải lên Excel tạo đơn" onUploaded={handleResetForm} />}
        />
      </div>

      <OrderFooterBar
        customerName={customerData?.name}
        customerCode={customerData?.code}
        addressText={addressData?.address}
        listLines={listLines}
        isSaving={isPending}
        canSave={canSubmit}
        onSave={handleSave}
        saveLabel="Tạo đơn hàng"
      />
    </div>
  )
}
