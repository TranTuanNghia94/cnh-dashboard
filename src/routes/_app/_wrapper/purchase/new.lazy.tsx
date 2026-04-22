import HeaderPageLayout from '@/components/layout/HeaderPage'
import ImportPurchaseExcelModal from '@/components/modal/purchase/import-excel'
import SelectOrder from '@/components/modal/purchase/select-order'
import { SectionStep } from '@/components/order/order-ui'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { IPurchaseLineExtends, PurchaseLineColumns } from '@/components/table/purchase/column-purchase-line'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetOrderByCode } from '@/hooks/use-order'
import { useCreatePurchaseOrder } from '@/hooks/use-purchase'
import { useToast } from '@/hooks/use-toast'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/constants'
import { buildOrderCode } from '@/lib/order-code'
import { formatCurrencyVN, numberWithCommas } from '@/lib/other'
import { cn } from '@/lib/utils'
import { IOrderLineResponse, IOrderResponse } from '@/types/order'
import { IProductResponse } from '@/types/product'
import { IPurchaseCreateRequest, IPurchaseOrderLineCreateRequest } from '@/types/purchase'
import { IVendorResponse } from '@/types/vendor'
import { createLazyFileRoute, useBlocker, useRouter } from '@tanstack/react-router'
import { ClipboardList, Package, Save, ShoppingCart, RefreshCcw } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'

type PurchaseLineWithKey = IPurchaseOrderLineCreateRequest & {
  clientLineId: string
  product?: IProductResponse
  vendor?: IVendorResponse
  saleOrderLine?: IOrderLineResponse
}

function buildImportMergeKey(
  line: Pick<
    PurchaseLineWithKey,
    'productId' | 'vendorId' | 'quote' | 'invoice' | 'receiptWarehouse' | 'billOfLadding' | 'trackId' | 'purchaseContractNumber'
  >,
): string {
  return [
    String(line.productId ?? ''),
    String(line.vendorId ?? ''),
    String(line.quote ?? '').trim().toUpperCase(),
    String(line.invoice ?? '').trim().toUpperCase(),
    String(line.receiptWarehouse ?? '').trim().toUpperCase(),
    String(line.billOfLadding ?? '').trim().toUpperCase(),
    String(line.trackId ?? '').trim().toUpperCase(),
    String(line.purchaseContractNumber ?? '').trim().toUpperCase(),
  ].join('|')
}

function mergeImportedLines(existing: PurchaseLineWithKey[], imported: PurchaseLineWithKey[]): PurchaseLineWithKey[] {
  if (imported.length === 0) return existing
  const keyToIndex = new Map<string, number>()
  existing.forEach((line, index) => keyToIndex.set(buildImportMergeKey(line), index))
  const next = [...existing]

  imported.forEach((line) => {
    const key = buildImportMergeKey(line)
    const existingIndex = keyToIndex.get(key)
    if (existingIndex === undefined) {
      next.push(line)
      keyToIndex.set(key, next.length - 1)
      return
    }

    const oldLine = next[existingIndex]
    next[existingIndex] = {
      ...oldLine,
      ...line,
      clientLineId: line.clientLineId,
      purchaseOrderId: oldLine.purchaseOrderId || line.purchaseOrderId,
      saleOrderLineId: oldLine.saleOrderLineId || line.saleOrderLineId,
      saleOrderLine: oldLine.saleOrderLine ?? line.saleOrderLine,
    }
  })

  return next
}

function attachSaleOrderLineId(
  lines: PurchaseLineWithKey[],
  orderLines: IOrderLineResponse[],
): PurchaseLineWithKey[] {
  if (lines.length === 0 || orderLines.length === 0) return lines
  let changed = false

  const pickMatch = (line: PurchaseLineWithKey): IOrderLineResponse | undefined => {
    const productId = String(line.productId ?? '')
    const vendorId = String(line.vendorId ?? '')
    return (
      orderLines.find((ol) => ol.productId === productId && ol.vendorId === vendorId) ??
      orderLines.find((ol) => ol.productId === productId)
    )
  }

  const next = lines.map((line) => {
    if (line.saleOrderLineId) return line
    const matched = pickMatch(line)
    if (!matched?.id) return line
    changed = true
    return {
      ...line,
      saleOrderLineId: matched.id,
      saleOrderLine: line.saleOrderLine ?? matched,
    }
  })

  return changed ? next : lines
}

function stripLineKeys(lines: PurchaseLineWithKey[]): IPurchaseOrderLineCreateRequest[] {
  return lines.map((line) => {
    const { clientLineId, product, vendor, saleOrderLine, ...rest } = line
    void clientLineId
    void product
    void vendor
    void saleOrderLine
    return rest
  })
}

function toPurchaseCreateRequest(params: {
  selectedOrder: IOrderResponse
  notes?: string
  purchaseLines: PurchaseLineWithKey[]
}): IPurchaseCreateRequest {
  const { selectedOrder, notes, purchaseLines } = params
  const today = moment().format('YYYY-MM-DD')
  return {
    orderId: selectedOrder.id,
    orderDate: today,
    expectedDeliveryDate: today,
    status: 'DRAFT',
    notes: notes?.trim() ?? '',
    purchaseOrderLines: stripLineKeys(purchaseLines),
  }
}

export const Route = createLazyFileRoute('/_app/_wrapper/purchase/new')({
  component: NewPurchasePage,
})

function NewPurchasePage() {
  const { mutateAsync, isSuccess, data, isPending: isCreatingPo } = useCreatePurchaseOrder()
  const { mutateAsync: fetchOrderByCode, isPending: isLoadingOrderDetail } = useGetOrderByCode()
  const { toast } = useToast()
  const { history } = useRouter()

  const [selectedOrder, setSelectedOrder] = useState<IOrderResponse>()
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLineWithKey[]>([])

  const isDirty = !!selectedOrder || purchaseLines.length > 0

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: isDirty && !isSuccess,
  })

  const canSubmit = !!selectedOrder && purchaseLines.length > 0 && !isCreatingPo && !isLoadingOrderDetail

  useEffect(() => {
    if (data && isSuccess) {
      toast({ title: 'Thao tác thành công', description: 'Tạo đơn mua hàng thành công', variant: 'success' })
      history.back()
    }
  }, [isSuccess, data, toast, history])

  const mapOrderLinesToPurchaseLines = useCallback((lines: IOrderLineResponse[]): PurchaseLineWithKey[] =>
    lines.map((line: IOrderLineResponse) => ({
      clientLineId: crypto.randomUUID(),
      purchaseOrderId: '',
      saleOrderLineId: line.id,
      productId: line.productId,
      vendorId: line.vendorId,
      product: { id: line.productId, name: line.productNameSuggest, code: line.productCodeSuggest } as IProductResponse,
      vendor: { id: line.vendorId, name: line.vendorNameSuggest, code: line.vendorCodeSuggest } as IVendorResponse,
      link: '',
      quantity: line.quantity,
      uom1: line.uom ?? '',
      uom2: '',
      unitPrice: line.unitPrice,
      isTaxIncluded: line.isIncludedTax,
      tax: line.taxRate ?? 0,
      totalBeforeTax: line.totalAmount,
      totalPrice: line.totalAmount,
      currency: 'VND',
      exchangeRate: 1,
      totalPriceVnd: line.totalAmount,
      note: line.notes ?? '',
      quote: '',
      invoice: '',
      billOfLadding: '',
      receiptWarehouse: '',
      trackId: '',
      purchaseContractNumber: '',
    })), [])

  /** Danh sách /list thường không có orderLines — cần gọi GET theo mã giống trang chi tiết đơn hàng. */
  const handleSelectOrder = useCallback(async (order: IOrderResponse) => {
    const code = buildOrderCode(order) ?? ''
    try {
      const res = await fetchOrderByCode(code ?? '')
      const full = res?.data as IOrderResponse | undefined
      if (!full) {
        toast({
          variant: 'destructive',
          title: 'Không tải được đơn hàng',
          description: 'Không nhận được dữ liệu từ máy chủ.',
        })
        return
      }
      setSelectedOrder(full)
      const lines = full.orderLines ?? []
      if (lines.length > 0) {
        setPurchaseLines(mapOrderLinesToPurchaseLines(lines))
      } else {
        setPurchaseLines([])
        toast({
          variant: 'destructive',
          title: 'Đơn hàng chưa có chi tiết',
          description: 'Vui lòng thêm sản phẩm vào đơn hàng trước khi tạo đơn mua hàng.',
        })
      }
    } catch {
      setPurchaseLines([])
    }
  }, [fetchOrderByCode, mapOrderLinesToPurchaseLines, toast])

  const handleDeleteLine = useCallback((index: number) => {
    setPurchaseLines(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateLine = useCallback((index: number, field: string, value: unknown) => {
    setPurchaseLines(prev => prev.map((line, i) => {
      if (i !== index) return line
      if (field === 'vendor') {
        const v = value as IVendorResponse
        const sol = line.saleOrderLine
        return {
          ...line,
          vendorId: v.id,
          vendor: v,
          saleOrderLine: sol
            ? {
                ...sol,
                vendorId: v.id,
                vendorCodeSuggest: v.code,
                vendorNameSuggest: v.name,
              }
            : sol,
        }
      }
      const updated = { ...line, [field]: value } as PurchaseLineWithKey
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalBeforeTax = (updated.quantity ?? 0) * (updated.unitPrice ?? 0)
        const taxAmount = updated.isTaxIncluded ? 0 : (updated.totalBeforeTax * (updated.tax ?? 0)) / 100
        updated.totalPrice = updated.totalBeforeTax + taxAmount
        updated.totalPriceVnd = updated.currency === 'VND'
          ? updated.totalPrice
          : updated.totalPrice * (updated.exchangeRate ?? 1)
      }
      if (field === 'tax') {
        const taxAmount = updated.isTaxIncluded ? 0 : (updated.totalBeforeTax * (value as number)) / 100
        updated.totalPrice = updated.totalBeforeTax + taxAmount
        updated.totalPriceVnd = updated.currency === 'VND'
          ? updated.totalPrice
          : updated.totalPrice * (updated.exchangeRate ?? 1)
      }
      if (field === 'exchangeRate') {
        updated.totalPriceVnd = updated.currency === 'VND'
          ? updated.totalPrice
          : updated.totalPrice * (value as number)
      }
      if (field === 'currency') {
        updated.totalPriceVnd = value === 'VND'
          ? updated.totalPrice
          : updated.totalPrice * (updated.exchangeRate ?? 1)
      }
      return updated
    }))
  }, [])

  const handleDuplicateLine = useCallback((index: number) => {
    setPurchaseLines(prev => {
      const cur = prev[index]
      if (!cur) return prev
      const copy: PurchaseLineWithKey = {
        ...cur,
        clientLineId: crypto.randomUUID(),
        saleOrderLine: cur.saleOrderLine ? { ...cur.saleOrderLine } : cur.saleOrderLine,
        product: cur.product ? { ...cur.product } as IProductResponse : cur.product,
        vendor: cur.vendor ? { ...cur.vendor } as IVendorResponse : cur.vendor,
      }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!canSubmit || !selectedOrder) return
    const payload = toPurchaseCreateRequest({
      selectedOrder,
      purchaseLines,
    })

    await mutateAsync(payload)
  }, [canSubmit, selectedOrder, purchaseLines, mutateAsync])

  const handleReset = useCallback(() => {
    setSelectedOrder(undefined)
    setPurchaseLines([])
  }, [])

  const tableData: IPurchaseLineExtends[] = useMemo(
    () => purchaseLines.map((line, i) => ({
      ...line,
      clientLineId: line.clientLineId,
      index: i,
      onDelete: () => handleDeleteLine(i),
      onDuplicate: () => handleDuplicateLine(i),
      onUpdate: (field: string, value: unknown) => handleUpdateLine(i, field, value),
      onSelectVendor: (vendor: IVendorResponse) => handleUpdateLine(i, 'vendor', vendor),
    })),
    [purchaseLines, handleDeleteLine, handleDuplicateLine, handleUpdateLine],
  )

  const totalAmountVnd = useMemo(
    () => purchaseLines.reduce((acc, l) => acc + (l.totalPriceVnd ?? 0), 0),
    [purchaseLines],
  )

  const totalsByCurrency = useMemo(() => {
    const map: Record<string, number> = {}
    purchaseLines.forEach((line) => {
      const curr = (line.currency ?? 'VND').toUpperCase()
      map[curr] = (map[curr] ?? 0) + (line.totalPrice ?? 0)
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([curr, amount]) => ({ curr, amount }))
  }, [purchaseLines])

  const productIndex = useMemo(() => {
    const map: Record<string, IProductResponse | undefined> = {}
    purchaseLines.forEach((l) => {
      const code = String(l.product?.code ?? '').trim().toUpperCase()
      if (code) map[code] = l.product as IProductResponse
    })
    return map
  }, [purchaseLines])

  const vendorIndex = useMemo(() => {
    const map: Record<string, IVendorResponse | undefined> = {}
    purchaseLines.forEach((l) => {
      const code = String(l.vendor?.code ?? '').trim().toUpperCase()
      if (code) map[code] = l.vendor as IVendorResponse
    })
    return map
  }, [purchaseLines])

  const stepItems = useMemo(() => [
    {
      icon: ClipboardList,
      label: 'Chọn đơn hàng',
      helper: selectedOrder
        ? `${selectedOrder.orderPrefix}-${selectedOrder.orderNumber} (${selectedOrder.customer?.name ?? ''})`
        : 'Chọn đơn hàng để lấy danh sách sản phẩm',
      state: (selectedOrder ? 'done' : 'current') as 'done' | 'current' | 'pending',
    },
    {
      icon: Package,
      label: 'Kiểm tra sản phẩm',
      helper: purchaseLines.length > 0
        ? `${purchaseLines.length} dòng sản phẩm`
        : 'Danh sách sản phẩm từ đơn hàng',
      state: (purchaseLines.length > 0 ? 'done' : selectedOrder ? 'current' : 'pending') as 'done' | 'current' | 'pending',
    },
    {
      icon: ShoppingCart,
      label: 'Rà soát PO',
      helper: purchaseLines.length > 0 ? 'Kiểm tra NCC, số lượng, đơn giá' : 'Danh sách sản phẩm từ đơn hàng',
      state: (purchaseLines.length > 0 ? 'done' : selectedOrder ? 'current' : 'pending') as 'done' | 'current' | 'pending',
    },
    {
      icon: Save,
      label: 'Xác nhận & lưu',
      helper: canSubmit ? 'Sẵn sàng tạo đơn mua hàng' : 'Hoàn tất các bước trên',
      state: (canSubmit ? 'done' : 'pending') as 'done' | 'current' | 'pending',
    },
  ], [selectedOrder, purchaseLines.length, canSubmit])

  return (
    <div className="pb-28">
      <HeaderPageLayout title="Tạo đơn mua hàng" buttonSubmit={<></>} />

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stepItems.map(step => (
          <SectionStep key={step.label} icon={step.icon} label={step.label} helper={step.helper} state={step.state} />
        ))}
      </div>

      {/* Order Selection & Info */}
      <div className="mt-4 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="uppercase">Đơn hàng nguồn</CardTitle>
                <CardDescription>Chọn đơn hàng để lấy sản phẩm cần mua</CardDescription>
              </div>
              <SelectOrder
                onSelectOrder={handleSelectOrder}
                disabled={isLoadingOrderDetail}
              />
            </div>
          </CardHeader>
          <CardContent>
            {selectedOrder ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Mã đơn hàng</span>
                    <p className="font-semibold">{buildOrderCode(selectedOrder)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Trạng thái</span>
                    <div>
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px]', ORDER_STATUS_STYLES[selectedOrder.status] ?? ORDER_STATUS_STYLES['DEFAULT'])}
                      >
                        {ORDER_STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Khách hàng</span>
                    <p className="font-medium">{selectedOrder.customer?.name ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Số hợp đồng</span>
                    <p className="font-medium">{selectedOrder.contractNumber ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Ngày đặt</span>
                    <p>{selectedOrder.orderDate ? moment(selectedOrder.orderDate).format('DD/MM/YYYY') : '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Thành tiền</span>
                    <p className="font-semibold">{numberWithCommas(Number(selectedOrder.finalAmount ?? 0))}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedOrder.orderLines?.length ?? 0} dòng sản phẩm
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                Chưa chọn đơn hàng. Bấm "Chọn đơn hàng" để bắt đầu.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Purchase Lines Table */}
      <Card className="mt-4">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="uppercase">Chi tiết đơn mua hàng</CardTitle>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                {purchaseLines.length} dòng
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Tổng quy đổi: <span className="font-semibold text-foreground">{formatCurrencyVN(totalAmountVnd)}</span>
            </p>
            {totalsByCurrency.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {totalsByCurrency.map(({ curr, amount }) => (
                  <Badge key={curr} variant="outline">
                    {curr}: {numberWithCommas(amount)}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {purchaseLines.length > 0
                ? 'Cùng mã hàng có thể nhiều dòng với NCC khác: icon sao chép để nhân dòng, nút "Đổi NCC" để chọn nhà cung cấp khác.'
                : 'Chọn đơn hàng để tự động thêm sản phẩm'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportPurchaseExcelModal
              disabled={!selectedOrder}
              productIndex={productIndex}
              vendorIndex={vendorIndex}
              onImportLines={(lines) => {
                const orderLines = selectedOrder?.orderLines ?? []
                const enriched = attachSaleOrderLineId(lines as PurchaseLineWithKey[], orderLines)
                setPurchaseLines(prev => mergeImportedLines(prev, enriched))
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <DataTableDetail
            data={tableData}
            getRowId={(row) => row.clientLineId}
            wrapperClassName="h-[calc(60vh-100px)] max-h-[calc(60vh-100px)]"
            columns={PurchaseLineColumns}
            noDataText="Chưa có sản phẩm nào. Chọn đơn hàng để bắt đầu."
          />
        </CardContent>
      </Card>

      {/* Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Đơn hàng</span>
              <span className="font-medium text-foreground">
                {selectedOrder ? `${selectedOrder.orderPrefix}-${selectedOrder.orderNumber}` : '—'}
              </span>
              {selectedOrder?.customer && (
                <span className="text-[10px] text-muted-foreground">{selectedOrder.customer.name}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tổng tiền PO</span>
              <span className="font-semibold text-foreground">{formatCurrencyVN(totalAmountVnd)}</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {totalsByCurrency.slice(0, 3).map(({ curr, amount }) => (
                  <span key={curr} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {curr}: {numberWithCommas(amount)}
                  </span>
                ))}
                {totalsByCurrency.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{totalsByCurrency.length - 3} loại tiền</span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{purchaseLines.length} dòng</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Ngày PO</span>
              <span className="font-medium text-foreground">
                {moment().format('DD/MM/YYYY')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isCreatingPo}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button type="button" size="sm" disabled={!canSubmit || isCreatingPo} onClick={handleSave}>
              {isCreatingPo
                ? <><RefreshCcw className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                : <><Save className="mr-2 h-4 w-4" />Tạo đơn mua hàng</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
