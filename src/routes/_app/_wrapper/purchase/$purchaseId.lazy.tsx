import HeaderPageLayout from '@/components/layout/HeaderPage'
import ImportPurchaseExcelModal from '@/components/modal/purchase/import-excel'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { IPurchaseLineExtends, PurchaseLineColumns, PurchaseLineSummary, PurchaseLineTableFooter, sumPurchaseLineTotals } from '@/components/table/purchase/column-purchase-line'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useGetOrderByCode } from '@/hooks/use-order'
import { useGetPurchaseById, useUpdatePurchaseOrder } from '@/hooks/use-purchase'
import { useToast } from '@/hooks/use-toast'
import { mergeImportedPurchaseLines } from '@/lib/purchase-import-merge'
import { downloadPurchaseOrderLinesExcel } from '@/lib/purchase-order-lines-excel'
import { formatCurrencyVN } from '@/lib/other'
import { buildOrderCode } from '@/lib/order-code'
import { cn } from '@/lib/utils'
import { getAllPurchases } from '@/services/purchase'
import { IOrderLineResponse, IOrderResponse } from '@/types/order'
import { IProductResponse } from '@/types/product'
import { IPurchaseCreateRequest, IPurchaseOrderLineCreateRequest, IPurchaseOrderResponse } from '@/types/purchase'
import { IVendorResponse } from '@/types/vendor'
import { createLazyFileRoute, useBlocker, useParams, useRouter } from '@tanstack/react-router'
import { Check, Download, RefreshCcw, Save, XIcon } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ProgressStatusFilter = 'all' | 'done' | 'remaining' | 'over'

const PROGRESS_STATUS_OPTIONS: { value: ProgressStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'done', label: 'Đã đủ' },
  { value: 'remaining', label: 'Còn lại' },
  { value: 'over', label: 'Vượt' },
]

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
    clientLineId: line.id || crypto.randomUUID(),
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
  const [progressQuery, setProgressQuery] = useState({ code: '', name: '' })
  const [progressStatus, setProgressStatus] = useState<ProgressStatusFilter>('all')
  const [lineQuery, setLineQuery] = useState({ code: '', name: '', vendor: '' })

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
        const curr = String(value).toUpperCase()
        updated.currency = curr
        if (curr === 'VND') {
          updated.exchangeRate = 1
        }
        updated.totalPriceVnd =
          curr === 'VND'
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

  const filteredTableData = useMemo(() => {
    const code = lineQuery.code.trim().toLowerCase()
    const name = lineQuery.name.trim().toLowerCase()
    const vendor = lineQuery.vendor.trim().toLowerCase()
    return tableData.filter((line) => {
      const productCode = (line.product?.code ?? '').toLowerCase()
      const productName = (line.product?.name ?? '').toLowerCase()
      const vendorText = `${line.vendor?.code ?? ''} ${line.vendor?.name ?? ''}`.toLowerCase()
      if (code && !productCode.includes(code)) return false
      if (name && !productName.includes(name)) return false
      if (vendor && !vendorText.includes(vendor)) return false
      return true
    })
  }, [tableData, lineQuery.code, lineQuery.name, lineQuery.vendor])

  const hasLineFilters = Boolean(lineQuery.code.trim() || lineQuery.name.trim() || lineQuery.vendor.trim())

  const lineTotals = useMemo(() => sumPurchaseLineTotals(filteredTableData), [filteredTableData])

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

  const fulfilledCount = useMemo(
    () => lineProgress.filter((item) => item.remainingQty === 0 && item.overQty === 0).length,
    [lineProgress],
  )

  const filteredLineProgress = useMemo(() => {
    const code = progressQuery.code.trim().toLowerCase()
    const name = progressQuery.name.trim().toLowerCase()
    return lineProgress.filter((item) => {
      if (code && !item.code.toLowerCase().includes(code)) return false
      if (name && !item.name.toLowerCase().includes(name)) return false
      if (progressStatus === 'done') return item.remainingQty === 0 && item.overQty === 0
      if (progressStatus === 'remaining') return item.remainingQty > 0
      if (progressStatus === 'over') return item.overQty > 0
      return true
    })
  }, [lineProgress, progressQuery.code, progressQuery.name, progressStatus])

  const hasProgressFilters = Boolean(progressQuery.code.trim() || progressQuery.name.trim() || progressStatus !== 'all')

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
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            {[
              ['Mã PO', purchaseData ? `${purchaseData.poPrefix}.${purchaseData.poNumber.toString().padStart(3, '0')}` : '—'],
              ['Mã đơn hàng', purchaseData?.order ? buildOrderCode(purchaseData.order) : '—'],
              ['Khách hàng', purchaseData?.order?.customer?.name ?? '—'],
              ['Số hợp đồng', purchaseData?.order?.contractNumber ?? '—'],
              ['Ngày PO', purchaseData?.orderDate ? moment(purchaseData.orderDate).format('DD/MM/YYYY') : '—'],
              ['Ngày hoàn thành', purchaseData?.expectedDeliveryDate ? moment(purchaseData.expectedDeliveryDate).format('DD/MM/YYYY') : '—'],
              ['Tổng tiền quy đổi', formatCurrencyVN(totalAmountVnd)],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 truncate font-medium">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Số dòng</dt>
              <dd className="mt-1">
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">{purchaseLines.length} dòng</Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="uppercase">Theo dõi số lượng theo dòng đơn hàng</CardTitle>
            <CardDescription>
              Đã mua gồm PO khác và PO này. Không lưu được nếu mua vượt số lượng đặt.
            </CardDescription>
          </div>
          {lineProgress.length > 0 && (
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="success">{fulfilledCount} đã đủ</Badge>
              {selectableProgress.length > 0 && (
                <Badge variant="outline">{selectableProgress.length} còn lại</Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {lineProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Không có dữ liệu dòng đơn hàng để đối chiếu. Nút &quot;Chọn item mua thêm&quot; sẽ bị khóa khi đơn hàng chưa có chi tiết.
            </p>
          ) : (
            <>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Mã hàng"
                  value={progressQuery.code}
                  onChange={(e) => setProgressQuery((prev) => ({ ...prev, code: e.target.value }))}
                />
                <Input
                  placeholder="Tên hàng"
                  value={progressQuery.name}
                  onChange={(e) => setProgressQuery((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {PROGRESS_STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={progressStatus === option.value ? 'default' : 'outline'}
                    className="h-8 px-3 text-xs"
                    onClick={() => setProgressStatus(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
                {hasProgressFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => {
                      setProgressQuery({ code: '', name: '' })
                      setProgressStatus('all')
                    }}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                    Xóa lọc
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Hiển thị {filteredLineProgress.length} / {lineProgress.length} dòng
            </p>
            <div className="max-h-96 divide-y overflow-y-auto rounded-lg">
              {filteredLineProgress.length === 0 ? (
                <p className="px-3 py-6 text-sm text-muted-foreground">Không có dòng nào khớp bộ lọc.</p>
              ) : filteredLineProgress.map((item) => {
                const isDone = item.remainingQty === 0 && item.overQty === 0
                const isOver = item.overQty > 0
                const progress = item.orderedQty > 0
                  ? Math.min(item.purchasedTotal / item.orderedQty, 1)
                  : 0

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3',
                      isDone && 'bg-success-light',
                      isOver && 'bg-destructive/5',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        isDone && 'bg-success text-success-foreground',
                        isOver && 'bg-destructive text-destructive-foreground',
                        !isDone && !isOver && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : item.remainingQty}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-medium', isDone && 'text-foreground/80')}>
                        {item.code}
                        {item.name ? <span className="font-normal text-muted-foreground"> · {item.name}</span> : null}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Đặt {item.orderedQty} · Đã mua {item.purchasedTotal}
                        {item.purchasedOther > 0 ? ` · PO khác ${item.purchasedOther}` : ''}
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            isDone && 'bg-success',
                            isOver && 'bg-destructive',
                            !isDone && !isOver && 'bg-primary',
                          )}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                    {isDone ? (
                      <Badge variant="success" className="shrink-0">Đã đủ</Badge>
                    ) : isOver ? (
                      <Badge variant="destructive" className="shrink-0">Vượt {item.overQty}</Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">Còn lại {item.remainingQty}</Badge>
                    )}
                  </div>
                )
              })}
            </div>
            </>
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
                setPurchaseLines(prev => mergeImportedPurchaseLines(prev, enriched))
                setHasPendingChanges(true)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {purchaseLines.length > 0 && (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="grid flex-1 gap-3 md:grid-cols-3">
                <Input
                  placeholder="Mã hàng"
                  value={lineQuery.code}
                  onChange={(e) => setLineQuery((prev) => ({ ...prev, code: e.target.value }))}
                />
                <Input
                  placeholder="Tên hàng"
                  value={lineQuery.name}
                  onChange={(e) => setLineQuery((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Nhà cung cấp"
                  value={lineQuery.vendor}
                  onChange={(e) => setLineQuery((prev) => ({ ...prev, vendor: e.target.value }))}
                />
              </div>
              {hasLineFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => setLineQuery({ code: '', name: '', vendor: '' })}
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Xóa lọc
                </Button>
              )}
            </div>
          )}
          {purchaseLines.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Hiển thị {filteredTableData.length} / {purchaseLines.length} dòng
            </p>
          )}
          <DataTableDetail
            data={filteredTableData}
            getRowId={(row) => row.clientLineId}
            wrapperClassName="h-[calc(70vh-100px)] max-h-[calc(70vh-100px)]"
            columns={PurchaseLineColumns}
            noDataText={hasLineFilters ? 'Không có dòng nào khớp bộ lọc.' : 'Chưa có sản phẩm nào.'}
            resetPageToken={`${lineQuery.code}|${lineQuery.name}|${lineQuery.vendor}`}
            summary={filteredTableData.length > 0 ? <PurchaseLineSummary {...lineTotals} /> : null}
            tableFooter={filteredTableData.length > 0 ? <PurchaseLineTableFooter {...lineTotals} /> : null}
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