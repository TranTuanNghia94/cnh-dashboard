import HeaderPageLayout from '@/components/layout/HeaderPage'
import FindAddress from '@/components/modal/address/find'
import FindCustomer from '@/components/modal/customer/find'
import OrderLineCreate from '@/components/modal/order/order-line-create'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { OrderLineColumns } from '@/components/table/order/columns-order-line'
import { Button } from '@/components/ui/button'
import CalendarPicker from '@/components/ui/calendar-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { FilterBadge, SectionStatusBadge, OrderSummaryCard,  type OrderSummaryMeta } from '@/components/order/order-ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetOrderByCode, useUpdateOrder } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { IAddressResponse } from '@/types/address'
import { ICustomerResponse } from '@/types/customer'
import { IOrderCreateRequest, IOrderLineCreateRequest } from '@/types/order'
import { cn } from '@/lib/utils'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import { AlertTriangle, ClipboardList, ListChecks, RefreshCcw, XIcon } from 'lucide-react'
import moment from 'moment'
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/constants'

export const Route = createLazyFileRoute('/_app/_wrapper/order/$orderId')({
  component: UpdateOrderPage,
})

function UpdateOrderPage() {
  const { orderId } = useParams({ strict: false })
  const { mutateAsync: fetchOrderByCode, data: orderResponse, isPending } = useGetOrderByCode()
  const { mutateAsync: updateOrderInfo, isPending: isSavingInfo } = useUpdateOrder()
  const { mutateAsync: updateOrderLines, isPending: isSavingLines } = useUpdateOrder()
  const { toast } = useToast()

  const [listLines, setListLines] = useState<IOrderLineCreateRequest[]>([])
  const [customerData, setCustomerData] = useState<ICustomerResponse>()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dateDelivery, setDateDelivery] = useState<Date | undefined>(undefined)
  const [addressData, setAddressData] = useState<IAddressResponse>()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lineFilters, setLineFilters] = useState({
    code: '',
    name: '',
    vendor: '',
  })
  const infoFormRef = useRef<HTMLFormElement>(null)
  const [lastSavedInfoAt, setLastSavedInfoAt] = useState<Date | null>(null)
  const [lastSavedLinesAt, setLastSavedLinesAt] = useState<Date | null>(null)
  const hasFilters = useMemo(
    () => Object.values(lineFilters).some((value) => Boolean(value.trim())),
    [lineFilters],
  )

  const getData = useCallback(
    async (code: string) => {
      await fetchOrderByCode(code)
    },
    [fetchOrderByCode],
  )

  const handleRefresh = useCallback(async () => {
    if (!orderId) return
    setIsRefreshing(true)
    try {
      await getData(orderId as string)
    } finally {
      setIsRefreshing(false)
    }
  }, [getData, orderId])

  useEffect(() => {
    if (orderId) {
      getData(orderId as string)
    }
  }, [getData, orderId])

  useEffect(() => {
    if (orderResponse?.data) {
      const orderData = orderResponse.data
      setDate(orderData.orderDate ? new Date(orderData.orderDate) : undefined)
      setDateDelivery(
        orderData?.deliveryDate ? new Date(orderData.deliveryDate) : undefined,
      )
      setCustomerData(orderData?.customer)
      setAddressData(orderData?.customerAddress)
      setListLines(orderData?.orderLines ?? [])
      setLastSavedInfoAt(orderData?.updatedAt ? new Date(orderData.updatedAt) : null)
      setLastSavedLinesAt(orderData?.updatedAt ? new Date(orderData.updatedAt) : null)
    }
  }, [orderResponse])

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

  const handleFilterChange = useCallback(
    (field: keyof typeof lineFilters) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setLineFilters((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const handleRemoveFilter = useCallback(
    (field: keyof typeof lineFilters) => () => {
      setLineFilters((prev) => ({ ...prev, [field]: '' }))
    },
    [],
  )

  const handleClearFilters = useCallback(() => {
    setLineFilters({
      code: '',
      name: '',
      vendor: '',
    })
  }, [])

  const activeFilterBadges = useMemo(
    () =>
      (
        [
          { key: 'code', label: 'Mã hàng', value: lineFilters.code },
          { key: 'name', label: 'Tên hàng', value: lineFilters.name },
          { key: 'vendor', label: 'Nhà cung cấp', value: lineFilters.vendor },
        ] as const
      ).filter((filter) => Boolean(filter.value.trim())),
    [lineFilters.code, lineFilters.name, lineFilters.vendor],
  )

  const filteredLines = useMemo(() => {
    const codeFilter = lineFilters.code.trim().toLowerCase()
    const nameFilter = lineFilters.name.trim().toLowerCase()
    const vendorFilter = lineFilters.vendor.trim().toLowerCase()

    return listLines
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        const productCode = (item.productCodeSuggest ?? '').toLowerCase()
        const productName = (item.productNameSuggest ?? '').toLowerCase()
        const vendorName = (
          item.vendorNameSuggest ??
          item.vendorCodeSuggest ??
          ''
        ).toLowerCase()

        const matchCode = !codeFilter || productCode.includes(codeFilter)
        const matchName = !nameFilter || productName.includes(nameFilter)
        const matchVendor = !vendorFilter || vendorName.includes(vendorFilter)

        return matchCode && matchName && matchVendor
      })
  }, [lineFilters, listLines])

  const tableData = useMemo(
    () =>
      filteredLines?.map(({ item, originalIndex }) => ({
        ...item,
        deleteRow: () => handleDeleteOrderLine(originalIndex),
        updateRow: (val: IOrderLineCreateRequest) =>
          handleUpdateOrderLine(originalIndex, val),
      })),
    [filteredLines, handleDeleteOrderLine, handleUpdateOrderLine],
  )

  const totals = useMemo(() => {
    return listLines.reduce(
      (acc, item) => {
        const quantity = Number(item.quantity ?? 0)
        const amount =
          Number(item.totalAmount ?? 0) || quantity * Number(item.unitPrice ?? 0)
        return {
          quantity: acc.quantity + quantity,
          amount: acc.amount + amount,
        }
      },
      { quantity: 0, amount: 0 },
    )
  }, [listLines])

  const hasCustomer = Boolean(customerData?.id)
  const hasAddress = Boolean(addressData?.id)
  const disableAddLine = !hasCustomer || !hasAddress
  const isInitialLoading = isPending && !orderResponse
  const emptyTableText = listLines.length
    ? 'Không tìm thấy sản phẩm phù hợp.'
    : 'Chưa có chi tiết nào.'
  const canSaveInfo = Boolean(
    hasCustomer && date && !isInitialLoading,
  )
  const canSaveLines = Boolean(listLines.length && !isInitialLoading)

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    [],
  )
  const formattedTempTotal = currencyFormatter.format(totals.amount)
  const orderMeta: OrderSummaryMeta | null = useMemo(() => {
    if (!orderResponse?.data) return null
    const data = orderResponse.data
    const orderCode =
      (data.orderPrefix ?? '') + (data.orderNumber ? data.orderNumber.toString() : '')
    const statusKey = (data.status ?? '').toUpperCase()

    return {
      code: orderCode || '—',
      statusLabel: ORDER_STATUS_LABELS[statusKey] ?? (statusKey || '—'),
      statusClass: ORDER_STATUS_STYLES[statusKey] ?? ORDER_STATUS_STYLES.DEFAULT,
      updatedAtText: data.updatedAt ? moment(data.updatedAt).fromNow() : 'Chưa cập nhật',
      createdAtText: data.createdAt
        ? moment(data.createdAt).format('DD/MM/YYYY HH:mm')
        : null,
      lineCount: listLines.length,
      customerName: data.customer?.name ?? '—',
      customerCode: data.customer?.code,
    }
  }, [listLines.length, orderResponse?.data])

  const infoLastSavedLabel = lastSavedInfoAt
    ? `Đã lưu ${moment(lastSavedInfoAt).fromNow()}`
    : 'Chưa lưu thay đổi'
  const lineLastSavedLabel = lastSavedLinesAt
    ? `Đã lưu ${moment(lastSavedLinesAt).fromNow()}`
    : 'Chưa lưu chi tiết'
  const infoButtonHint = !canSaveInfo
    ? 'Hoàn tất các trường bắt buộc trước khi lưu'
    : isSavingLines
      ? 'Đang lưu chi tiết, vui lòng đợi'
      : infoLastSavedLabel
  const lineButtonHint = !canSaveLines
    ? 'Cần ít nhất một dòng sản phẩm để lưu'
    : isSavingInfo
      ? 'Đang lưu thông tin chung, vui lòng đợi'
      : lineLastSavedLabel

  const generalSectionStatus = useMemo(() => {
    const missing: string[] = []
    if (!customerData?.id) missing.push('khách hàng')
    if (!date) missing.push('ngày hợp đồng')
    // if (!dateDelivery) missing.push('ngày giao dự kiến')
    const ready = missing.length === 0
    return {
      ready,
      label: ready ? 'Đủ điều kiện lưu' : 'Thiếu thông tin',
      helper: ready ? 'Tất cả trường bắt buộc đã có dữ liệu' : `Còn thiếu: ${missing.join(', ')}`,
    }
  }, [customerData?.id, date, dateDelivery])

  const shippingSectionStatus = useMemo(() => {
    const ready = Boolean(addressData?.id)
    return {
      ready,
      label: ready ? 'Đã có địa chỉ' : 'Thiếu địa chỉ',
      helper: ready
        ? addressData?.address ?? 'Đã chọn địa chỉ giao hàng'
        : 'Chọn địa chỉ giao hàng để tiếp tục',
    }
  }, [addressData?.address, addressData?.id])

  const linesSectionStatus = useMemo(() => {
    const ready = listLines.length > 0
    return {
      ready,
      label: ready ? 'Đủ điều kiện lưu' : 'Cần thêm sản phẩm',
      helper: ready
        ? `${listLines.length} dòng sản phẩm sẽ được lưu`
        : 'Thêm tối thiểu một dòng để lưu chi tiết',
    }
  }, [listLines.length])

  const blockingBanner = useMemo(() => {
    if (generalSectionStatus.ready && shippingSectionStatus.ready) {
      return null
    }

    const messages: string[] = []
    if (!customerData?.id) messages.push('Chọn khách hàng')
    if (!addressData?.id) messages.push('Chọn địa chỉ giao hàng')
    if (!date) messages.push('Chọn ngày hợp đồng')
    // if (!dateDelivery) messages.push('Chọn ngày giao dự kiến')

    return {
      title: 'Hoàn thiện thông tin trước khi lưu',
      description: messages.join(' · '),
    }
  }, [
    addressData?.id,
    customerData?.id,
    date,
    dateDelivery,
    generalSectionStatus.ready,
    shippingSectionStatus.ready,
  ])

  const buildOrderPayload = useCallback(
    (formData?: FormData): IOrderCreateRequest | null => {
      if (
        !orderResponse?.data ||
        !customerData?.id ||
        !addressData?.id ||
        !date ||
        !dateDelivery
      ) {
        return null
      }

      const contractNumber =
        formData?.get('contractNumber')?.toString().trim() ??
        orderResponse.data.contractNumber ??
        ''

      const notes =
        formData?.get('notes')?.toString().trim() ?? orderResponse.data.notes ?? ''

      return {
        id: orderResponse.data.id,
        customerId: customerData.id,
        customerAddressId: addressData.id,
        contractNumber,
        orderDate: moment(date).format('YYYY-MM-DD'),
        deliveryDate: moment(dateDelivery).format('YYYY-MM-DD'),
        status: orderResponse.data.status ?? 'DRAFT',
        totalAmount: totals.amount,
        discountAmount: orderResponse.data.discountAmount ?? 0,
        taxAmount: orderResponse.data.taxAmount ?? 0,
        finalAmount: totals.amount,
        notes
      }
    },
    [
      addressData?.id,
      customerData?.id,
      date,
      dateDelivery,
      listLines,
      orderResponse?.data,
      totals.amount,
    ],
  )

  const notifyMissingInfo = useCallback(() => {
    toast({
      variant: 'destructive',
      title: 'Thiếu thông tin',
      description: 'Vui lòng chọn khách hàng, địa chỉ và ngày hợp lệ trước khi lưu.',
    })
  }, [toast])

  const handleSaveOrderInfo = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const payload = buildOrderPayload(formData)

      if (!payload) {
        notifyMissingInfo()
        return
      }

      await updateOrderInfo(payload)
      toast({
        title: 'Lưu thành công',
        description: 'Đã cập nhật thông tin chung & giao hàng.',
        variant: 'success',
      })
      setLastSavedInfoAt(new Date())
      handleRefresh()
    },
    [buildOrderPayload, handleRefresh, notifyMissingInfo, toast, updateOrderInfo],
  )

  const handleSaveOrderLines = useCallback(async () => {
    if (!listLines.length) {
      toast({
        variant: 'destructive',
        title: 'Chưa có chi tiết',
        description: 'Vui lòng thêm ít nhất một dòng sản phẩm trước khi lưu chi tiết.',
      })
      return
    }
    const formData = infoFormRef.current ? new FormData(infoFormRef.current) : undefined
    const payload = buildOrderPayload(formData)

    if (!payload) {
      notifyMissingInfo()
      return
    }

      await updateOrderLines(payload)
    toast({
      title: 'Lưu thành công',
      description: 'Đã cập nhật chi tiết đơn hàng.',
      variant: 'success',
    })
    setLastSavedLinesAt(new Date())
    handleRefresh()
  }, [
    buildOrderPayload,
    handleRefresh,
    listLines.length,
    notifyMissingInfo,
    toast,
    updateOrderLines,
  ])

  return (
    <div>
      <HeaderPageLayout
        idForm="formOrderInfo"
        title="Chỉnh sửa đơn hàng"
        buttonSubmit={
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">{infoLastSavedLabel}</p>
          </div>
        }
        otherButton={
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isInitialLoading || isRefreshing}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Làm mới dữ liệu đơn hàng"
          >
            <RefreshCcw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Đang tải lại...' : 'Làm mới đơn hàng'}</span>
          </Button>
        }
      />

      {blockingBanner && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800">
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
          totalText={formattedTempTotal}
          deliveryText={dateDelivery ? moment(dateDelivery).format('DD/MM/YYYY') : '—'}
          addressText={addressData?.address}
        />
      )}

      <Tabs defaultValue="general" className="mt-4">
        <TabsList className="w-full justify-start gap-2 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="general" className="px-3 py-1.5 text-xs">
            Thông tin chung
          </TabsTrigger>
          <TabsTrigger value="lines" className="px-3 py-1.5 text-xs">
            Chi tiết đơn hàng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <div className="col-span-4">
            <form
              id="formOrderInfo"
              ref={infoFormRef}
              onSubmit={handleSaveOrderInfo}
              className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-4"
            >
              <Card
                className={cn(
                  !generalSectionStatus.ready &&
                  'border-dashed border-destructive/60 bg-destructive/5 transition-colors',
                )}
              >
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="uppercase">Thông tin chung</CardTitle>
                    <CardDescription>{generalSectionStatus.helper}</CardDescription>
                  </div>
                  <SectionStatusBadge ready={generalSectionStatus.ready} label={generalSectionStatus.label} />
                </CardHeader>
                <CardContent>
                  {isInitialLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="grid grid-cols-5 gap-x-6">
                      <div className="col-span-3">
                        <Label className="text-xs" htmlFor="contractNumber">
                          Số hợp đồng<span className="text-red-600">*</span>
                        </Label>
                        <Input
                          name="contractNumber"
                          required
                          className="col-span-2"
                          placeholder="Nhập số hợp đồng"
                          defaultValue={orderResponse?.data?.contractNumber ?? ''}
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
                        <Label className="text-xs" htmlFor="customerId">
                          Khách hàng<span className="text-red-600">*</span>
                        </Label>
                        <div className="flex flex-1 flex-col gap-y-2">
                          <div className="flex gap-x-4">
                            <Input
                              disabled
                              name="customerId"
                              required
                              className="col-span-2"
                              value={customerData?.name ?? ''}
                              placeholder="Chưa chọn khách hàng"
                            />
                            <FindCustomer handleSelect={handleSelectCustomer} />
                          </div>
                          {!hasCustomer && (
                            <p className="text-xs text-muted-foreground">
                              Chọn khách hàng để mở danh sách địa chỉ giao hàng.
                            </p>
                          )}
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
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={cn(
                  !shippingSectionStatus.ready &&
                  'border-dashed border-destructive/60 bg-destructive/5 transition-colors',
                )}
              >
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="uppercase">Thông tin giao hàng</CardTitle>
                    <CardDescription>{shippingSectionStatus.helper}</CardDescription>
                  </div>
                  <SectionStatusBadge ready={shippingSectionStatus.ready} label={shippingSectionStatus.label} />
                </CardHeader>
                <CardContent>
                  {isInitialLoading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <Label className="text-xs" htmlFor="contactPerson">
                          Người nhận
                        </Label>
                        <div className="flex flex-1 flex-col gap-y-2">
                          <div className="flex gap-x-4">
                            <Input
                              name="contactPerson"
                              className="col-span-2"
                              disabled
                              value={addressData?.contactPerson ?? ''}
                              placeholder="Chưa có thông tin"
                            />
                            <FindAddress
                              disabled={!hasCustomer}
                              setAddressData={handleSelectAddress}
                              customerId={(customerData?.id as string) || null}
                            />
                          </div>
                          {!hasCustomer && (
                            <p className="text-xs text-muted-foreground">
                              Vui lòng chọn khách hàng trước khi tìm địa chỉ.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs" htmlFor="phone">
                          SĐT
                        </Label>
                        <Input
                          name="phone"
                          className="col-span-2"
                          type="tel"
                          disabled
                          value={addressData?.phone ?? ''}
                          placeholder="—"
                        />
                      </div>

                      <div className="col-span-2 mt-2">
                        <Label className="text-xs" htmlFor="deliveryAddress">
                          Địa chỉ giao hàng
                        </Label>
                        <Input
                          name="deliveryAddress"
                          className="col-span-2"
                          disabled
                          value={addressData?.address ?? ''}
                          placeholder="—"
                        />
                      </div>

                      <div className="col-span-2 mt-2">
                        <Label className="text-xs" htmlFor="notes">
                          Ghi chú
                        </Label>
                        <Input name="notes" className="col-span-2" defaultValue={orderResponse?.data?.notes ?? ''} placeholder="Ghi chú bổ sung" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="lg:col-span-2 rounded-2xl border bg-background/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Lưu phần thông tin chung & giao hàng
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Các thay đổi về hợp đồng, khách hàng và địa chỉ sẽ được cập nhật ngay sau khi lưu.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      type="submit"
                      size="sm"
                      form="formOrderInfo"
                      className="gap-2"
                      disabled={!canSaveInfo || isSavingInfo || isSavingLines}
                    >
                      {isSavingInfo ? (
                        <>
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <ClipboardList className="h-4 w-4" />
                          Lưu thông tin chung
                        </>
                      )}
                    </Button>
                    <span className="text-[11px] text-muted-foreground text-right">{infoButtonHint}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="lines" className="mt-4">
          <div className="col-span-8">
            <Card>
              <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="uppercase">Chi tiết đơn hàng</CardTitle>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                      {listLines.length} dòng
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tổng tiền hiện tại:{' '}
                    <span className="font-semibold text-foreground">{formattedTempTotal}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{linesSectionStatus.helper}</p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:items-end sm:text-right">
                  <p>Thêm dòng sản phẩm và lưu để cập nhật chi tiết đơn hàng.</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <OrderLineCreate saveDetail={handleAddOrderLine} disabled={disableAddLine} />
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="gap-2"
                      disabled={!canSaveLines || isSavingLines || isSavingInfo}
                      onClick={handleSaveOrderLines}
                    >
                      {isSavingLines ? (
                        <>
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                          Đang lưu chi tiết
                        </>
                      ) : (
                        <>
                          <ListChecks className="h-4 w-4" />
                          Lưu chi tiết
                        </>
                      )}
                    </Button>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{lineButtonHint}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                    <div className="grid flex-1 gap-3 md:grid-cols-3">
                      <Input
                        placeholder="Mã hàng"
                        value={lineFilters.code}
                        onChange={handleFilterChange('code')}
                      />
                      <Input
                        placeholder="Tên hàng"
                        value={lineFilters.name}
                        onChange={handleFilterChange('name')}
                      />
                      <Input
                        placeholder="Nhà cung cấp"
                        value={lineFilters.vendor}
                        onChange={handleFilterChange('vendor')}
                      />
                    </div>
                    <div className="flex gap-2 lg:w-auto">
                      {hasFilters && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={handleClearFilters}
                        >
                          <XIcon className="h-3.5 w-3.5" />
                          Xóa tất cả lọc
                        </Button>
                      )}
                    </div>
                  </div>

                  {hasFilters && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Đang áp dụng {activeFilterBadges.length} bộ lọc:</span>
                      {activeFilterBadges.map((filter) => (
                        <FilterBadge
                          key={filter.key}
                          label={filter.label}
                          value={filter.value}
                          onClear={handleRemoveFilter(filter.key)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      Hiển thị {tableData.length} / {listLines.length} dòng sản phẩm
                    </span>
                    {disableAddLine && (
                      <p>
                        Chọn khách hàng và địa chỉ giao hàng để bật nút &quot;Thêm mới&quot;.
                      </p>
                    )}
                  </div>

                  <DataTableDetail
                    data={tableData}
                    wrapperClassName="h-[calc(82vh-175px)] max-h-[calc(82vh-175px)]"
                    columns={OrderLineColumns}
                    noDataText={emptyTableText}
                  />
                  {!listLines.length && (
                    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Chưa có chi tiết nào. Sử dụng nút &quot;Thêm mới&quot; để bắt đầu.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}




