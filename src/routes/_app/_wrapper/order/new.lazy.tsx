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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CardContent, CardTitle } from '@/components/ui/card'
import { createLazyFileRoute, useBlocker, useRouter } from '@tanstack/react-router'
import { FileDown, MapPin, Package, RefreshCcw, ShoppingCart, User } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/order/new')({
  component: NewOrderPage,
})

type WizardStep = 0 | 1 | 2 | 3

function stepState(index: number, currentStep: number): 'done' | 'current' | 'pending' {
  if (index < currentStep) return 'done'
  if (index === currentStep) return 'current'
  return 'pending'
}

function NewOrderPage() {
  const { mutateAsync, isSuccess, data, isPending } = useCreateOrder()
  const { toast } = useToast()
  const { history } = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const [currentStep, setCurrentStep] = useState<WizardStep>(0)
  const [listLines, setListLines] = useState<IOrderLineCreateRequest[]>([])
  const [customerData, setCustomerData] = useState<ICustomerResponse>()
  const [addressData, setAddressData] = useState<IAddressResponse>()
  const [date, setDate] = useState<Date | undefined>()
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>()
  const [contractNumber, setContractNumber] = useState('')

  const isDirty = !!customerData || !!addressData || listLines.length > 0 || !!date || !!dateDelivery || !!contractNumber.trim()

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: isDirty && !isSuccess,
  })

  const canStep0Next = !!customerData && !!date && !!dateDelivery && !!contractNumber.trim()
  const canStep2Next = listLines.length > 0
  const canSubmit = canStep0Next && listLines.length > 0 && !isPending

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
      customerAddressId: addressData?.id as string | undefined,
      contractNumber: contractNumber.trim() || formData.get('contractNumber')?.toString().trim() as string,
      orderDate: moment(date).format('YYYY-MM-DD'),
      deliveryDate: moment(dateDelivery).format('YYYY-MM-DD'),
      status: 'DRAFT',
      notes: formData.get('notes')?.toString().trim() as string,
      totalAmount: 0, discountAmount: 0, taxAmount: 0,
      finalAmount,
      orderLines: listLines,
    })
  }, [canSubmit, customerData, addressData, contractNumber, date, dateDelivery, listLines, mutateAsync])

  const handleResetForm = useCallback(() => {
    formRef.current?.reset()
    setCustomerData(undefined)
    setAddressData(undefined)
    setListLines([])
    setDate(undefined)
    setDateDelivery(undefined)
    setContractNumber('')
    setCurrentStep(0)
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

  const goNext = useCallback(() => {
    setCurrentStep(prev => (prev < 3 ? ((prev + 1) as WizardStep) : prev))
  }, [])

  const goBack = useCallback(() => {
    setCurrentStep(prev => (prev > 0 ? ((prev - 1) as WizardStep) : prev))
  }, [])

  const tableData = useMemo(
    () => listLines.map((item, i) => ({
      ...item,
      deleteRow: () => handleDeleteLine(i),
      updateRow: (val: IOrderLineCreateRequest) => handleUpdateLine(i, val),
    })),
    [listLines, handleDeleteLine, handleUpdateLine],
  )

  const formattedTotal = useMemo(
    () => formatCurrencyVN(listLines.reduce((acc, l) => acc + l.totalAmount, 0)),
    [listLines],
  )

  const stepItems = useMemo(() => [
    {
      icon: User,
      label: 'Chọn khách hàng',
      helper: customerData
        ? `${customerData.name} (${customerData.code})`
        : 'Chọn khách hàng, số HĐ và ngày',
      state: stepState(0, currentStep),
    },
    {
      icon: MapPin,
      label: 'Chọn địa chỉ giao hàng',
      helper: addressData?.address ?? 'Tùy chọn — có thể bỏ qua',
      state: stepState(1, currentStep),
    },
    {
      icon: Package,
      label: 'Thêm sản phẩm',
      helper: listLines.length > 0 ? `${listLines.length} dòng sản phẩm` : 'Thêm ít nhất một dòng sản phẩm',
      state: stepState(2, currentStep),
    },
    {
      icon: ShoppingCart,
      label: 'Xác nhận & lưu',
      helper: canSubmit ? 'Sẵn sàng tạo đơn hàng' : 'Kiểm tra lại thông tin trước khi lưu',
      state: stepState(3, currentStep),
    },
  ], [customerData, addressData, listLines.length, canSubmit, currentStep])

  const linesSectionHelper = listLines.length > 0
    ? `${listLines.length} dòng sản phẩm`
    : 'Thêm ít nhất một dòng để tạo đơn hàng'

  const canNext = currentStep === 0
    ? canStep0Next
    : currentStep === 1
      ? true
      : currentStep === 2
        ? canStep2Next
        : false

  const notesPreview = useMemo(() => {
    if (currentStep !== 3 || !formRef.current) return '—'
    return new FormData(formRef.current).get('notes')?.toString().trim() || '—'
  }, [currentStep])

  return (
    <div className="pb-28">
      <HeaderPageLayout
        title="Thêm đơn hàng"
        buttonSubmit={<></>}
        otherButton={
          <div className="flex flex-wrap items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" disabled={isPending}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận làm mới</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tất cả thông tin đã nhập sẽ bị xóa. Bạn có chắc muốn tiếp tục?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetForm}>Làm mới</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadBatchOrderExcelTemplate()}
              title="Bắt buộc: Mã hàng, Mã NCC, Số lượng, Đơn giá, ĐVT. Gồm thuế: 1 = đã gồm thuế, 0 = chưa. Tên hàng, Giáo viên, Phòng, Tham chiếu, Ghi chú — tùy chọn."
            >
              <FileDown className="mr-2 h-4 w-4" />
              Tải mẫu Excel
            </Button>
            <OrderBatchUploadModal triggerLabel="Tải lên Excel tạo đơn" onUploaded={handleResetForm} />
          </div>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stepItems.map(step => (
          <SectionStep key={step.label} icon={step.icon} label={step.label} helper={step.helper} state={step.state} />
        ))}
      </div>

      {/* Keep form fields mounted across steps so FormData values survive */}
      <OrderInfoForm
        formId="formCreateOrder"
        formRef={formRef}
        onSubmit={e => { e.preventDefault(); if (currentStep === 3) handleSave() }}
        date={date} setDate={setDate}
        dateDelivery={dateDelivery} setDateDelivery={setDateDelivery}
        contractNumber={contractNumber}
        onContractNumberChange={setContractNumber}
        customerData={customerData} onSelectCustomer={handleSelectCustomer}
        addressData={addressData} onSelectAddress={handleSelectAddress}
        visibleSections={
          currentStep === 0 ? ['general']
            : currentStep === 1 ? ['shipping']
              : []
        }
        className={currentStep === 0 || currentStep === 1 ? 'mt-4' : 'mt-4 hidden'}
      />

      <div className={currentStep === 2 ? 'mt-4' : 'mt-4 hidden'} aria-hidden={currentStep !== 2}>
        <OrderLinesSection
          listLines={listLines}
          tableData={tableData}
          formattedTotal={formattedTotal}
          linesSectionHelper={linesSectionHelper}
          onAddLine={handleAddLine}
          disableAddLine={!customerData}
          noDataText="Chưa có sản phẩm nào. Bấm 'Thêm mới' để bắt đầu."
          isSaving={isPending}
        />
      </div>

      {currentStep === 3 && (
        <div className="mt-4">
          <div className="mb-4">
            <CardTitle className="uppercase">Xác nhận & lưu</CardTitle>
            <p className="text-sm text-muted-foreground">Kiểm tra thông tin trước khi tạo đơn hàng</p>
          </div>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Khách hàng</dt>
                <dd className="font-medium">
                  {customerData ? `${customerData.name} (${customerData.code})` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Địa chỉ giao hàng</dt>
                <dd className="font-medium">{addressData?.address ?? 'Chưa chọn'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Số hợp đồng</dt>
                <dd className="font-medium">{contractNumber.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Ngày lập / Ngày giao</dt>
                <dd className="font-medium">
                  {date ? moment(date).format('DD/MM/YYYY') : '—'}
                  {' / '}
                  {dateDelivery ? moment(dateDelivery).format('DD/MM/YYYY') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Sản phẩm</dt>
                <dd className="font-medium">{listLines.length} dòng · {formattedTotal}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Ghi chú</dt>
                <dd className="font-medium">{notesPreview}</dd>
              </div>
            </dl>
          </CardContent>
        </div>
      )}

      <OrderFooterBar
        customerName={customerData?.name}
        customerCode={customerData?.code}
        addressText={addressData?.address}
        listLines={listLines}
        isSaving={isPending}
        canSave={canSubmit}
        onSave={handleSave}
        saveLabel="Tạo đơn hàng"
        showBack={currentStep > 0}
        showNext={currentStep < 3}
        showSkip={currentStep === 1}
        showSave={currentStep === 3}
        canNext={canNext}
        onBack={goBack}
        onNext={goNext}
        onSkip={goNext}
      />
    </div>
  )
}
