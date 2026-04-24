import HeaderPageLayout from '@/components/layout/HeaderPage'
import ImportPurchaseExcelModal from '@/components/modal/purchase/import-excel'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { IPurchaseLineExtends, PurchaseLineColumns } from '@/components/table/purchase/column-purchase-line'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGetOrderByCode } from '@/hooks/use-order'
import { useGetPurchaseById, useUpdatePurchaseOrder } from '@/hooks/use-purchase'
import { useToast } from '@/hooks/use-toast'
import { downloadPurchaseOrderLinesExcel } from '@/lib/purchase-order-lines-excel'
import { formatCurrencyVN } from '@/lib/other'
import { buildOrderCode } from '@/lib/order-code'
import { getAllPurchases } from '@/services/purchase'
import { IOrderLineResponse, IOrderResponse } from '@/types/order'
import { IProductResponse } from '@/types/product'
import { IPurchaseCreateRequest, IPurchaseOrderLineCreateRequest, IPurchaseOrderResponse } from '@/types/purchase'
import { IVendorResponse } from '@/types/vendor'
import { createLazyFileRoute, useBlocker, useParams, useRouter } from '@tanstack/react-router'
import { Download, RefreshCcw, Save } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'

type PurchaseLineWithKey = IPurchaseOrderLineCreateRequest & {
  clientLineId: string
  product?: IProductResponse
  vendor?: IVendorResponse
}

type LineProgressItem = {
  id: string
  code: string
  name: string
  orderedQty: number
  purchasedOther: number
  purchasedCurrent: number
  purchasedTotal: number
  remainingQty: number
  overQty: number
}

function mapPurchaseToLines(po: IPurchaseOrderResponse): PurchaseLineWithKey[] {
  return (po.purchaseOrderLines ?? []).map((line) => ({
    ...line,
    clientLineId: crypto.randomUUID(),
    product: line.product,
    vendor: line.vendor,
  }))
}

function stripLineKeys(lines: PurchaseLineWithKey[]): IPurchaseOrderLineCreateRequest[] {
  return lines.map((line) => {
    const { clientLineId, product, vendor, ...rest } = line
    void clientLineId
    void product
    void vendor
    return rest
  })
}

function sumBySaleOrderLineId(lines: Pick<IPurchaseOrderLineCreateRequest, 'saleOrderLineId' | 'quantity'>[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const line of lines) {
    const id = line.saleOrderLineId
    if (!id) continue
    map.set(id, (map.get(id) ?? 0) + Number(line.quantity ?? 0))
  }
  return map
}

function mapOrderLineToPurchaseLine(orderLine: IOrderLineResponse, purchaseOrderId: string): PurchaseLineWithKey {
  const quantity = Math.max(1, Number(orderLine.quantity ?? 1))
  const unitPrice = Number(orderLine.unitPrice ?? 0)
  const total = quantity * unitPrice
  return {
    clientLineId: crypto.randomUUID(),
    id: '',
    purchaseOrderId,
    saleOrderLineId: orderLine.id,
    productId: orderLine.productId,
    vendorId: orderLine.vendorId,
    product: {
      id: orderLine.productId,
      name: orderLine.productNameSuggest ?? orderLine.productName,
      code: orderLine.productCodeSuggest,
    } as IProductResponse,
    vendor: {
      id: orderLine.vendorId,
      name: orderLine.vendorNameSuggest ?? orderLine.vendorName,
      code: orderLine.vendorCodeSuggest,
    } as IVendorResponse,
    link: '',
    quantity,
    uom1: orderLine.uom ?? '',
    uom2: '',
    unitPrice,
    isTaxIncluded: orderLine.isIncludedTax ?? false,
    tax: Number(orderLine.taxRate ?? 0),
    totalBeforeTax: total,
    totalPrice: total,
    currency: 'VND',
    exchangeRate: 1,
    totalPriceVnd: total,
    note: orderLine.notes ?? '',
    quote: '',
    invoice: '',
    billOfLadding: '',
    receiptWarehouse: '',
    trackId: '',
    purchaseContractNumber: '',
  }
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
      id: oldLine.id,
      clientLineId: line.clientLineId,
      purchaseOrderId: oldLine.purchaseOrderId || line.purchaseOrderId,
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
    }
  })

  return changed ? next : lines
}

export const Route = createLazyFileRoute('/_app/_wrapper/purchase/$purchaseId')({
  component: PurchaseOrderDetailPage,
})

function PurchaseOrderDetailPage() {
  const { purchaseId } = useParams({ strict: false })
  const { history } = useRouter()
  const { toast } = useToast()
  const { mutateAsync: fetchPurchaseById, isPending: isLoading } = useGetPurchaseById()
  const { mutateAsync: fetchOrderByCode } = useGetOrderByCode()
  const { mutateAsync: updatePurchase, isPending: isSaving } = useUpdatePurchaseOrder()

  const [purchaseData, setPurchaseData] = useState<IPurchaseOrderResponse>()
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLineWithKey[]>([])
  const [otherPurchasedByLineId, setOtherPurchasedByLineId] = useState<Map<string, number>>(new Map())
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [selectMoreOpen, setSelectMoreOpen] = useState(false)
  const [selectedOrderLineIds, setSelectedOrderLineIds] = useState<Record<string, boolean>>({})

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: hasPendingChanges && !isSaving,
  })

  const loadData = useCallback(async () => {
    if (!purchaseId) return
    const res = await fetchPurchaseById(purchaseId)
    const po = res?.data as IPurchaseOrderResponse | undefined
    if (!po) return
    let finalPo = po
    const hasOrderLines = (po.order?.orderLines?.length ?? 0) > 0
    if (!hasOrderLines && po.order) {
      const code = buildOrderCode(po.order as Pick<IOrderResponse, 'id' | 'orderPrefix' | 'orderNumber'>)
      if (code) {
        try {
          const fullOrderRes = await fetchOrderByCode(code)
          const fullOrder = fullOrderRes?.data as IOrderResponse | undefined
          if (fullOrder) {
            finalPo = {
              ...po,
              order: fullOrder,
            }
          }
        } catch {
          // Fallback to PO payload when order detail API fails.
        }
      }
    }

    setPurchaseData(finalPo)
    setPurchaseLines(mapPurchaseToLines(po))
    setHasPendingChanges(false)

    // Cộng dồn SL đã mua ở các PO khác (cùng order), để kiểm soát vượt số lượng.
    const orderId = finalPo.order?.id
    if (!orderId) {
      setOtherPurchasedByLineId(new Map())
      return
    }
    const all: IPurchaseOrderResponse[] = []
    for (let page = 0; ; page++) {
      const pageRes = await getAllPurchases({ page, limit: 200 })
      const chunk = pageRes?.data?.data ?? []
      all.push(...chunk)
      const totalPage = pageRes?.data?.pagination?.totalPage ?? 1
      if (page + 1 >= totalPage || chunk.length === 0) break
    }
    const others = all.filter((item) => item.order?.id === orderId && item.id !== finalPo.id)
    const otherLines = others.flatMap((item) => item.purchaseOrderLines ?? [])
    setOtherPurchasedByLineId(sumBySaleOrderLineId(otherLines))
  }, [fetchOrderByCode, fetchPurchaseById, purchaseId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const orderLines = purchaseData?.order?.orderLines ?? []
    if (orderLines.length === 0) return
    setPurchaseLines((prev) => attachSaleOrderLineId(prev, orderLines))
  }, [purchaseData?.order?.orderLines])

  const handleDeleteLine = useCallback((index: number) => {
    setPurchaseLines(prev => prev.filter((_, i) => i !== index))
    setHasPendingChanges(true)
  }, [])

  const handleUpdateLine = useCallback((index: number, field: string, value: unknown) => {
    setPurchaseLines(prev => prev.map((line, i) => {
      if (i !== index) return line
      if (field === 'vendor') {
        const v = value as IVendorResponse
        return {
          ...line,
          vendorId: v.id,
          vendor: v,
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
    setHasPendingChanges(true)
  }, [])

  const handleDuplicateLine = useCallback((index: number) => {
    setPurchaseLines(prev => {
      const cur = prev[index]
      if (!cur) return prev
      const copy: PurchaseLineWithKey = {
        ...cur,
        id: '',
        clientLineId: crypto.randomUUID(),
        product: cur.product ? { ...cur.product } as IProductResponse : cur.product,
        vendor: cur.vendor ? { ...cur.vendor } as IVendorResponse : cur.vendor,
      }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
    setHasPendingChanges(true)
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

  const currentPurchasedByLineId = useMemo(
    () => sumBySaleOrderLineId(purchaseLines),
    [purchaseLines],
  )

  const lineProgress = useMemo<LineProgressItem[]>(() => {
    const lines = purchaseData?.order?.orderLines ?? []
    return lines.map((orderLine: IOrderLineResponse) => {
      const orderedQty = Number(orderLine.quantity ?? 0)
      const purchasedOther = otherPurchasedByLineId.get(orderLine.id) ?? 0
      const purchasedCurrent = currentPurchasedByLineId.get(orderLine.id) ?? 0
      const purchasedTotal = purchasedOther + purchasedCurrent
      const remainingQty = Math.max(0, orderedQty - purchasedTotal)
      const overQty = Math.max(0, purchasedTotal - orderedQty)
      return {
        id: orderLine.id,
        code: orderLine.productCodeSuggest ?? orderLine.productId,
        name: orderLine.productNameSuggest ?? orderLine.productName ?? '',
        orderedQty,
        purchasedOther,
        purchasedCurrent,
        purchasedTotal,
        remainingQty,
        overQty,
      }
    })
  }, [purchaseData?.order?.orderLines, otherPurchasedByLineId, currentPurchasedByLineId])

  const hasOverPurchased = useMemo(
    () => lineProgress.some((item) => item.overQty > 0),
    [lineProgress],
  )

  const selectableProgress = useMemo(
    () => lineProgress.filter((item) => item.remainingQty > 0),
    [lineProgress],
  )

  const selectedCount = useMemo(
    () => Object.values(selectedOrderLineIds).filter(Boolean).length,
    [selectedOrderLineIds],
  )

  const selectedSummary = useMemo(
    () => selectableProgress.filter((item) => selectedOrderLineIds[item.id]),
    [selectableProgress, selectedOrderLineIds],
  )

  const canAddSelected = selectedSummary.length > 0 && !!purchaseData

  const handleToggleOrderLine = useCallback((orderLineId: string, checked: boolean | 'indeterminate') => {
    setSelectedOrderLineIds((prev) => ({ ...prev, [orderLineId]: checked === true }))
  }, [])

  const handleSelectAllRemaining = useCallback((checked: boolean | 'indeterminate') => {
    const nextChecked = checked === true
    setSelectedOrderLineIds(() => {
      const next: Record<string, boolean> = {}
      selectableProgress.forEach((item) => {
        next[item.id] = nextChecked
      })
      return next
    })
  }, [selectableProgress])

  const handleAddSelectedItems = useCallback(() => {
    if (!purchaseData) return
    const orderLines = purchaseData.order?.orderLines ?? []
    const selectedLines = orderLines.filter((line) => selectedOrderLineIds[line.id])
    if (selectedLines.length === 0) return
    const newLines = selectedLines.map((line) => mapOrderLineToPurchaseLine(line, purchaseData.id))
    setPurchaseLines((prev) => [...prev, ...newLines])
    setHasPendingChanges(true)
    setSelectMoreOpen(false)
    setSelectedOrderLineIds({})
    toast({
      title: 'Đã thêm dòng mua hàng',
      description: `Đã thêm ${newLines.length} dòng từ chi tiết đơn hàng.`,
      variant: 'success',
    })
  }, [purchaseData, selectedOrderLineIds, toast])

  const handleExportDetailExcel = useCallback(() => {
    if (!purchaseData || purchaseLines.length === 0) return
    const poLabel = `${purchaseData.poPrefix}.${purchaseData.poNumber.toString().padStart(3, '0')}`
    const safe = poLabel.replace(/[^\w.-]+/g, '_')
    downloadPurchaseOrderLinesExcel(
      purchaseLines,
      `Chi-tiet-don-mua-hang_${safe}_${moment().format('YYYYMMDD-HHmm')}`,
    )
    toast({
      title: 'Đã xuất Excel',
      description: 'Chỉnh sửa file rồi dùng Import Excel để cập nhật hàng loạt.',
      variant: 'success',
    })
  }, [purchaseData, purchaseLines, toast])

  const handleSave = useCallback(async () => {
    if (!purchaseData) return
    if (hasOverPurchased) {
      toast({
        variant: 'destructive',
        title: 'Vượt số lượng đặt',
        description: 'Có dòng sản phẩm vượt số lượng của đơn hàng. Vui lòng giảm SL mua trước khi lưu.',
      })
      return
    }
    const payload: IPurchaseCreateRequest = {
      id: purchaseData.id,
      orderId: purchaseData.order?.id,
      orderDate: moment(purchaseData.orderDate).format('YYYY-MM-DD'),
      expectedDeliveryDate: moment(purchaseData.expectedDeliveryDate).format('YYYY-MM-DD'),
      status: purchaseData.status ?? 'DRAFT',
      notes: purchaseData.notes ?? '',
      purchaseOrderLines: stripLineKeys(purchaseLines).map((line) => ({
        ...line,
        purchaseOrderId: purchaseData.id,
      })),
    }
    await updatePurchase(payload)
    toast({ title: 'Lưu thành công', description: 'Đã cập nhật đơn mua hàng.', variant: 'success' })
    await loadData()
  }, [hasOverPurchased, loadData, purchaseData, purchaseLines, toast, updatePurchase])

  return (
    <div className="pb-28">
      <HeaderPageLayout
        title="Cập nhật đơn mua hàng"
        buttonSubmit={<></>}
        otherButton={
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => void loadData()}
            disabled={isLoading || isSaving}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCcw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            <span>{isLoading ? 'Đang tải lại...' : 'Làm mới'}</span>
          </Button>
        }
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="uppercase">Thông tin đơn mua</CardTitle>
          <CardDescription>Chỉnh sửa chi tiết và nhà cung cấp theo từng dòng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Mã PO</span>
              <p className="font-semibold">{purchaseData ? `${purchaseData.poPrefix}.${purchaseData.poNumber.toString().padStart(3, '0')}` : '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Mã đơn hàng</span>
              <p className="font-medium">{purchaseData?.order ? buildOrderCode(purchaseData.order) : '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Khách hàng</span>
              <p className="font-medium">{purchaseData?.order?.customer?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Số hợp đồng</span>
              <p className="font-medium">{purchaseData?.order?.contractNumber ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ngày PO</span>
              <p>{purchaseData?.orderDate ? moment(purchaseData.orderDate).format('DD/MM/YYYY') : '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ngày hoàn thành</span>
              <p>{purchaseData?.expectedDeliveryDate ? moment(purchaseData.expectedDeliveryDate).format('DD/MM/YYYY') : '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Tổng tiền quy đổi</span>
              <p className="font-semibold">{formatCurrencyVN(totalAmountVnd)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Số dòng</span>
              <Badge variant="secondary" className="ml-0 mt-1 rounded-full px-3 py-1 text-[11px]">{purchaseLines.length} dòng</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="uppercase">Theo dõi số lượng theo dòng đơn hàng</CardTitle>
          <CardDescription>
            Đã mua = PO khác + PO hiện tại. Hệ thống chặn lưu nếu bất kỳ dòng nào vượt số lượng đặt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lineProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có dữ liệu dòng đơn hàng để đối chiếu. Nút "Chọn item mua thêm" sẽ bị khóa khi đơn hàng chưa có chi tiết.
            </p>
          ) : (
            <div className="space-y-2">
              {lineProgress.map((item) => (
                <div key={item.id} className="rounded-lg border p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{item.code} {item.name ? `· ${item.name}` : ''}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Đặt: {item.orderedQty} | PO khác: {item.purchasedOther} | PO hiện tại: {item.purchasedCurrent}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary">Đã mua: {item.purchasedTotal}</Badge>
                      <Badge variant={item.overQty > 0 ? 'destructive' : 'outline'}>
                        {item.overQty > 0 ? `Vượt: ${item.overQty}` : `Còn lại: ${item.remainingQty}`}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="uppercase">Chi tiết đơn mua hàng</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tổng quy đổi: <span className="font-semibold text-foreground">{formatCurrencyVN(totalAmountVnd)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Chọn item cần mua thêm từ đơn hàng hoặc import Excel; vẫn có thể nhân dòng để mua cùng mã từ NCC khác.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={selectMoreOpen}
              onOpenChange={(open) => {
                setSelectMoreOpen(open)
                if (!open) setSelectedOrderLineIds({})
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!purchaseData || selectableProgress.length === 0}
                  title={selectableProgress.length === 0 ? 'Không còn item nào có số lượng còn lại để thêm.' : ''}
                >
                  Chọn item mua thêm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Chọn item cần mua thêm</DialogTitle>
                  <DialogDescription>
                    Chỉ hiển thị các dòng còn lại của đơn hàng. Bạn chọn dòng nào thì hệ thống chỉ thêm dòng đó vào PO.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="text-sm font-medium">Danh sách item còn lại</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={selectableProgress.length > 0 && selectedCount === selectableProgress.length}
                        onCheckedChange={handleSelectAllRemaining}
                        disabled={selectableProgress.length === 0}
                      />
                      <span>Chọn tất cả</span>
                    </div>
                  </div>
                  <div className="max-h-[45vh] overflow-auto">
                    {selectableProgress.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">Không còn dòng nào cần mua thêm.</p>
                    ) : (
                      <div className="divide-y">
                        {selectableProgress.map((item) => (
                          <label key={item.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-muted/30">
                            <Checkbox
                              className="mt-0.5"
                              checked={!!selectedOrderLineIds[item.id]}
                              onCheckedChange={(checked) => handleToggleOrderLine(item.id, checked)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {item.code} {item.name ? `· ${item.name}` : ''}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Đặt: {item.orderedQty} | Đã mua: {item.purchasedTotal} | Còn lại: {item.remainingQty}
                              </p>
                            </div>
                            <Badge variant="outline">Còn lại {item.remainingQty}</Badge>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedSummary.length > 0 && (
                  <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    Đã chọn {selectedSummary.length} item để thêm vào PO.
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Đóng</Button>
                  </DialogClose>
                  <Button size="sm" disabled={!canAddSelected} onClick={handleAddSelectedItems}>
                    Thêm item đã chọn
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!purchaseData || purchaseLines.length === 0}
              title={purchaseLines.length === 0 ? 'Chưa có dòng chi tiết để xuất.' : ''}
              onClick={handleExportDetailExcel}
            >
              <Download className="h-4 w-4" />
              Xuất Excel chi tiết
            </Button>

            <ImportPurchaseExcelModal
              disabled={!purchaseData}
              productIndex={productIndex}
              vendorIndex={vendorIndex}
              onImportLines={(lines) => {
                const orderLines = purchaseData?.order?.orderLines ?? []
                const enriched = attachSaleOrderLineId(lines as PurchaseLineWithKey[], orderLines)
                setPurchaseLines(prev => mergeImportedLines(prev, enriched))
                setHasPendingChanges(true)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTableDetail
            data={tableData}
            getRowId={(row) => row.clientLineId}
            wrapperClassName="h-[calc(70vh-100px)] max-h-[calc(70vh-100px)]"
            columns={PurchaseLineColumns}
            noDataText="Chưa có sản phẩm nào."
          />
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
          <div className="text-sm text-muted-foreground">
            {hasPendingChanges ? 'Có thay đổi chưa lưu' : 'Không có thay đổi mới'}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => history.back()} disabled={isSaving}>
              Quay lại
            </Button>
            <Button type="button" size="sm" disabled={!hasPendingChanges || isSaving || hasOverPurchased} onClick={() => void handleSave()}>
              {isSaving
                ? <><RefreshCcw className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                : <><Save className="mr-2 h-4 w-4" />Lưu cập nhật</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}