import HeaderPageLayout from '@/components/layout/HeaderPage'
import { OrderInfoForm, OrderLinesSection, OrderFooterBar } from '@/components/order/order-form-shared'
import type { LineFilters, FilterKey } from '@/components/order/order-form-shared'
import { OrderSummaryCard, type OrderSummaryMeta } from '@/components/order/order-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetOrderByCode, useUpdateOrder } from '@/hooks/use-order'
import { useCreateOrderLine, useDeleteOrderLine, useUpdateOrderLine } from '@/hooks/use-order-line'
import { useToast } from '@/hooks/use-toast'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { IAddressResponse } from '@/types/address'
import { ICustomerResponse } from '@/types/customer'
import { IOrderLineCreateRequest, IOrderUpdateRequest } from '@/types/order'
import { createLazyFileRoute, useBlocker, useParams } from '@tanstack/react-router'
import { formatCurrencyVN } from '@/lib/other'
import { AlertTriangle, ClipboardList, ListChecks, RefreshCcw } from 'lucide-react'
import moment from 'moment'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/order/$orderId')({
  component: UpdateOrderPage,
})

function UpdateOrderPage() {
  const { orderId } = useParams({ strict: false })
  const { mutateAsync: fetchOrderByCode, data: orderResponse, isPending } = useGetOrderByCode()
  const { mutateAsync: updateOrder, isPending: isSavingOrder } = useUpdateOrder()
  const { mutateAsync: createLines, isPending: isCreatingLines } = useCreateOrderLine()
  const { mutateAsync: updateLines, isPending: isUpdatingLines } = useUpdateOrderLine()
  const { mutateAsync: deleteLines, isPending: isDeletingLines } = useDeleteOrderLine()
  const { toast } = useToast()

  const [listLines, setListLines] = useState<IOrderLineCreateRequest[]>([])
  const [customerData, setCustomerData] = useState<ICustomerResponse>()
  const [addressData, setAddressData] = useState<IAddressResponse>()
  const [date, setDate] = useState<Date | undefined>()
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lineFilters, setLineFilters] = useState<LineFilters>({ code: '', name: '', vendor: '' })
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const infoFormRef = useRef<HTMLFormElement>(null)
  const serverLineIds = useRef<Set<string>>(new Set())

  const isSaving = isSavingOrder || isCreatingLines || isUpdatingLines || isDeletingLines
  const ordData = orderResponse?.data

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: hasPendingChanges,
  })

  // ---- Data loading ----

  const getData = useCallback(async (code: string) => {
    await fetchOrderByCode(code)
  }, [fetchOrderByCode])

  const handleRefresh = useCallback(async () => {
    if (!orderId) return
    setIsRefreshing(true)
    try { await getData(orderId) } finally { setIsRefreshing(false) }
  }, [getData, orderId])

  useEffect(() => {
    if (orderId) getData(orderId)
  }, [getData, orderId])

  useEffect(() => {
    if (!ordData) return
    setDate(ordData.orderDate ? new Date(ordData.orderDate) : undefined)
    setDateDelivery(ordData.deliveryDate ? new Date(ordData.deliveryDate) : undefined)
    setCustomerData(ordData.customer)
    setAddressData(ordData.customerAddress)
    setListLines(ordData.orderLines ?? [])
    setLastSavedAt(ordData.updatedAt ? new Date(ordData.updatedAt) : null)
    serverLineIds.current = new Set(
      (ordData.orderLines ?? []).map(l => l.id).filter(Boolean) as string[],
    )
  }, [ordData, orderResponse])

  // ---- Line handlers ----

  const handleAddLine = useCallback((val: IOrderLineCreateRequest) => {
    setListLines(prev => [...prev, val])
    setHasPendingChanges(true)
  }, [])

  const handleDeleteLine = useCallback((i: number) => {
    setListLines(prev => prev.filter((_, idx) => idx !== i))
    setHasPendingChanges(true)
  }, [])

  const handleUpdateLine = useCallback((i: number, val: IOrderLineCreateRequest) => {
    setListLines(prev => prev.map((item, idx) => idx === i ? val : item))
    setHasPendingChanges(true)
  }, [])

  // ---- Customer / address handlers ----

  const handleSelectCustomer = useCallback((data: ICustomerResponse) => {
    setCustomerData(data)
    setAddressData(undefined)
    setHasPendingChanges(true)
  }, [])

  const handleSelectAddress = useCallback((data: IAddressResponse) => {
    setAddressData(data)
    setHasPendingChanges(true)
  }, [])

  // ---- Filter handlers ----

  const handleFilterChange = useCallback(
    (field: FilterKey) => (e: ChangeEvent<HTMLInputElement>) =>
      setLineFilters(prev => ({ ...prev, [field]: e.target.value })),
    [],
  )

  const handleRemoveFilter = useCallback(
    (field: FilterKey) => () =>
      setLineFilters(prev => ({ ...prev, [field]: '' })),
    [],
  )

  const handleClearFilters = useCallback(() =>
    setLineFilters({ code: '', name: '', vendor: '' }), [])

  // ---- Derived state ----

  const hasCustomer = Boolean(customerData?.id)
  const hasAddress = Boolean(addressData?.id)
  const isInitialLoading = isPending && !orderResponse
  const canSave = hasCustomer && Boolean(date) && Boolean(dateDelivery) && !isInitialLoading
  const lastSavedLabel = lastSavedAt ? `Đã lưu ${moment(lastSavedAt).fromNow()}` : 'Chưa lưu thay đổi'

  const totals = useMemo(() => listLines.reduce(
    (acc, item) => {
      const qty = Number(item.quantity ?? 0)
      const amt = Number(item.totalAmount ?? 0) || qty * Number(item.unitPrice ?? 0)
      return { quantity: acc.quantity + qty, amount: acc.amount + amt }
    },
    { quantity: 0, amount: 0 },
  ), [listLines])

  const hasFilters = useMemo(() => Object.values(lineFilters).some(v => Boolean(v.trim())), [lineFilters])

  const activeFilterBadges = useMemo(() => (
    [
      { key: 'code' as const, label: 'Mã hàng', value: lineFilters.code },
      { key: 'name' as const, label: 'Tên hàng', value: lineFilters.name },
      { key: 'vendor' as const, label: 'Nhà cung cấp', value: lineFilters.vendor },
    ] satisfies { key: FilterKey; label: string; value: string }[]
  ).filter(f => Boolean(f.value.trim())), [lineFilters.code, lineFilters.name, lineFilters.vendor])

  const filteredLines = useMemo(() => {
    const cf = lineFilters.code.trim().toLowerCase()
    const nf = lineFilters.name.trim().toLowerCase()
    const vf = lineFilters.vendor.trim().toLowerCase()
    return listLines
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) =>
        (!cf || (item.productCodeSuggest ?? '').toLowerCase().includes(cf)) &&
        (!nf || (item.productNameSuggest ?? '').toLowerCase().includes(nf)) &&
        (!vf || (item.vendorNameSuggest ?? item.vendorCodeSuggest ?? '').toLowerCase().includes(vf)),
      )
  }, [lineFilters, listLines])

  const tableData = useMemo(
    () => filteredLines.map(({ item, originalIndex }) => ({
      ...item,
      deleteRow: () => handleDeleteLine(originalIndex),
      updateRow: (val: IOrderLineCreateRequest) => handleUpdateLine(originalIndex, val),
    })),
    [filteredLines, handleDeleteLine, handleUpdateLine],
  )

  const generalSectionStatus = useMemo(() => {
    const missing = [!hasCustomer && 'khách hàng', !date && 'ngày hợp đồng'].filter(Boolean) as string[]
    const ready = missing.length === 0
    return {
      ready,
      label: ready ? 'Đủ điều kiện lưu' : 'Thiếu thông tin',
      helper: ready ? 'Tất cả trường bắt buộc đã có dữ liệu' : `Còn thiếu: ${missing.join(', ')}`,
    }
  }, [hasCustomer, date])

  const shippingSectionStatus = useMemo(() => ({
    ready: hasAddress,
    label: hasAddress ? 'Đã có địa chỉ' : 'Thiếu địa chỉ',
    helper: hasAddress
      ? (addressData?.address ?? 'Đã chọn địa chỉ giao hàng')
      : 'Chọn địa chỉ giao hàng để tiếp tục',
  }), [hasAddress, addressData?.address])

  const linesSectionStatus = useMemo(() => {
    const ready = listLines.length > 0
    return {
      ready,
      label: ready ? 'Đủ điều kiện lưu' : 'Cần thêm sản phẩm',
      helper: ready ? `${listLines.length} dòng sản phẩm` : 'Thêm tối thiểu một dòng',
    }
  }, [listLines.length])

  const blockingBanner = (!generalSectionStatus.ready || !shippingSectionStatus.ready) ? {
    title: 'Hoàn thiện thông tin trước khi lưu',
    description: [
      !hasCustomer && 'Chọn khách hàng',
      !hasAddress && 'Chọn địa chỉ giao hàng',
      !date && 'Chọn ngày hợp đồng',
    ].filter(Boolean).join(' · '),
  } : null

  const orderMeta: OrderSummaryMeta | null = useMemo(() => {
    if (!ordData) return null
    const orderCode = (ordData.orderPrefix ?? '') + (ordData.orderNumber?.toString() ?? '')
    const statusKey = (ordData.status ?? '').toUpperCase()
    return {
      code: orderCode || '—',
      statusLabel: ORDER_STATUS_LABELS[statusKey] ?? (statusKey || '—'),
      statusClass: ORDER_STATUS_STYLES[statusKey] ?? ORDER_STATUS_STYLES.DEFAULT,
      updatedAtText: ordData.updatedAt ? moment(ordData.updatedAt).fromNow() : 'Chưa cập nhật',
      createdAtText: ordData.createdAt ? moment(ordData.createdAt).format('DD/MM/YYYY HH:mm') : null,
      lineCount: listLines.length,
      customerName: ordData.customer?.name ?? '—',
      customerCode: ordData.customer?.code,
    }
  }, [listLines.length, ordData])

  // ---- Save ----

  const handleSave = useCallback(async () => {
    if (!ordData || !customerData?.id || !date) {
      toast({ variant: 'destructive', title: 'Thiếu thông tin', description: 'Vui lòng chọn khách hàng và ngày hợp lệ trước khi lưu.' })
      return
    }

    const formData = infoFormRef.current ? new FormData(infoFormRef.current) : undefined
    const ordId = ordData.id

    // 1. Delete removed lines
    const currentIds = new Set(listLines.map(l => l.id).filter(Boolean))
    const deletedIds = [...serverLineIds.current].filter(id => !currentIds.has(id))
    if (deletedIds.length) await deleteLines({ orderId: ordId, ids: deletedIds })

    // 2. Create new lines (no id)
    const newLines = listLines.filter(l => !l.id)
    if (newLines.length) await createLines({ orderLines: newLines, orderId: ordId })

    // 3. Update existing lines (has id)
    const existingLines = listLines.filter(l => l.id) as IOrderUpdateRequest[]
    if (existingLines.length) await updateLines({ orderLines: existingLines, orderId: ordId })

    // 4. Update order header (so totalAmount reflects final line state)
    await updateOrder({
      id: ordData.id,
      customerId: customerData.id,
      customerAddressId: addressData?.id as string,
      contractNumber: formData?.get('contractNumber')?.toString().trim() ?? ordData.contractNumber ?? '',
      orderDate: moment(date).format('YYYY-MM-DD'),
      deliveryDate: moment(dateDelivery).format('YYYY-MM-DD'),
      status: ordData.status ?? 'DRAFT',
      totalAmount: totals.amount,
      discountAmount: ordData.discountAmount ?? 0,
      taxAmount: ordData.taxAmount ?? 0,
      finalAmount: totals.amount,
      notes: formData?.get('notes')?.toString().trim() ?? ordData.notes ?? '',
    })

    toast({ title: 'Lưu thành công', description: 'Đã cập nhật đơn hàng.', variant: 'success' })
    setLastSavedAt(new Date())
    setHasPendingChanges(false)
    handleRefresh()
  }, [
    ordData, customerData, addressData, date, dateDelivery, listLines, totals.amount,
    updateOrder, createLines, updateLines, deleteLines, toast, handleRefresh,
  ])

  // ---- Render ----

  return (
    <div className="pb-28">
      <HeaderPageLayout
        title="Chỉnh sửa đơn hàng"
        buttonSubmit={
          <div className="flex items-center gap-3">
            {hasPendingChanges ? (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Có thay đổi chưa lưu
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">{lastSavedLabel}</span>
            )}
          </div>
        }
        otherButton={
          <Button
            type="button" size="sm" variant="ghost"
            onClick={handleRefresh}
            disabled={isInitialLoading || isRefreshing}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCcw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span>{isRefreshing ? 'Đang tải lại...' : 'Làm mới'}</span>
          </Button>
        }
      />

      {blockingBanner && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold">{blockingBanner.title}</p>
            <p className="text-xs text-amber-800">{blockingBanner.description}</p>
          </div>
        </div>
      )}

      {orderMeta && (
        <OrderSummaryCard
          meta={orderMeta}
          totalText={formatCurrencyVN(totals.amount)}
          deliveryText={dateDelivery ? moment(dateDelivery).format('DD/MM/YYYY') : '—'}
          addressText={addressData?.address}
        />
      )}

      <Tabs defaultValue="general" className="mt-4">
        <TabsList className="w-full justify-start gap-2 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="general" className="relative gap-2 px-3 py-1.5 text-xs">
            <ClipboardList className="h-3.5 w-3.5" />
            Thông tin chung
            {hasPendingChanges && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="lines" className="relative gap-2 px-3 py-1.5 text-xs">
            <ListChecks className="h-3.5 w-3.5" />
            Chi tiết đơn hàng
            {listLines.length > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full px-2 py-0 text-[10px]">
                {listLines.length}
              </Badge>
            )}
            {hasPendingChanges && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <OrderInfoForm
            formId="formOrderInfo"
            formRef={infoFormRef}
            onSubmit={e => { e.preventDefault(); handleSave() }}
            defaultContractNumber={ordData?.contractNumber}
            date={date} setDate={setDate}
            dateDelivery={dateDelivery} setDateDelivery={setDateDelivery}
            customerData={customerData} onSelectCustomer={handleSelectCustomer}
            addressData={addressData} onSelectAddress={handleSelectAddress}
            defaultNotes={ordData?.notes}
            isLoading={isInitialLoading}
            generalStatus={generalSectionStatus}
            shippingStatus={shippingSectionStatus}
          />
        </TabsContent>

        <TabsContent value="lines" className="mt-4">
          <OrderLinesSection
            listLines={listLines}
            tableData={tableData}
            formattedTotal={formatCurrencyVN(totals.amount)}
            linesSectionHelper={linesSectionStatus.helper}
            onAddLine={handleAddLine}
            disableAddLine={!hasCustomer || !hasAddress}
            noDataText={listLines.length ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có chi tiết nào.'}
            filters={{
              values: lineFilters,
              activeFilterBadges,
              hasFilters,
              onChange: handleFilterChange,
              onRemove: handleRemoveFilter,
              onClear: handleClearFilters,
            }}
          />
        </TabsContent>
      </Tabs>

      <OrderFooterBar
        customerName={customerData?.name}
        customerCode={customerData?.code}
        addressText={addressData?.address}
        listLines={listLines}
        hasPendingChanges={hasPendingChanges}
        isSaving={isSaving}
        canSave={canSave}
        onSave={handleSave}
      />
    </div>
  )
}

