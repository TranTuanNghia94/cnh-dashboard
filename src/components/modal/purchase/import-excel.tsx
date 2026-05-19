import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { getProductByCode } from '@/services/product'
import { getAllVendors } from '@/services/vendor'
import { IProductResponse } from '@/types/product'
import { IVendorResponse } from '@/types/vendor'
import { IPurchaseOrderLineCreateRequest } from '@/types/purchase'
import { AlertCircle, Check, Copy, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useMemo, useRef, useState } from 'react'
import { IOrderLineResponse } from '@/types/order'

type ImportResult = {
  totalRows: number
  totalSuccess: number
  totalErrors: number
  errors: string[]
}

type ParsedRow = {
  lineId?: string
  productCode: string
  productName?: string
  vendorCode: string
  vendorName?: string
  quantity: number
  unitPrice: number
  currency: string
  exchangeRate: number
  uom1?: string
  tax?: number
  quote?: string
  invoice?: string
  receiptWarehouse?: string
  billOfLadding?: string
  trackId?: string
  note?: string
}

type ImportPurchaseLine = IPurchaseOrderLineCreateRequest & {
  clientLineId: string
  product?: IProductResponse
  vendor?: IVendorResponse
  saleOrderLine?: IOrderLineResponse
}

type Props = {
  disabled?: boolean
  /** fallback: lấy product/vendor từ orderLines theo code */
  productIndex?: Record<string, IProductResponse | undefined>
  vendorIndex?: Record<string, IVendorResponse | undefined>
  onImportLines: (lines: ImportPurchaseLine[]) => void
}

const normalizeHeader = (h: unknown) =>
  String(h ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')

const pick = (row: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const val = row[k]
    if (val !== undefined && val !== null && String(val).trim() !== '') return val
  }
  return undefined
}

const toNumber = (val: unknown): number | undefined => {
  if (val === undefined || val === null) return undefined
  const raw = String(val).replace(/,/g, '').trim()
  if (!raw) return undefined
  const num = Number(raw)
  return Number.isFinite(num) ? num : undefined
}

const normalizeCode = (val: unknown): string =>
  String(val ?? '')
    .trim()
    .replace(/^'+/, '')
    .toUpperCase()

export default function ImportPurchaseExcelModal({
  disabled,
  productIndex,
  vendorIndex,
  onImportLines,
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = useMemo(() => '.xlsx,.xls,.csv', [])

  const resetState = () => {
    setSelectedFile(null)
    setResult(null)
    setCopied(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) resetState()
  }

  const handleCopyErrors = async () => {
    if (!result?.errors?.length) return
    await navigator.clipboard.writeText(result.errors.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const parseFile = async (file: File): Promise<ParsedRow[]> => {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

    if (!raw.length) return []

    // normalize headers once
    const normalized = raw.map((r) => {
      const o: Record<string, unknown> = {}
      Object.keys(r).forEach((k) => {
        o[normalizeHeader(k)] = r[k]
      })
      return o
    })

    return normalized.map((r) => {
      const productCode = normalizeCode(
        pick(r, ['PRODUCT_CODE', 'MA_HANG', 'MAHANG', 'MA_HANG_CUSTOMER', 'PRODUCT', 'CODE']) ?? ''
      )
      const vendorCode = normalizeCode(
        pick(r, ['VENDOR_CODE', 'VENDOR', 'MA_NCC', 'MANCC', 'NHA_CUNG_CAP', 'SUPPLIER_CODE']) ?? ''
      )
      const quantity = toNumber(pick(r, ['QUANTITY', 'SL_MUA', 'SL', 'SO_LUONG'])) ?? 0
      const unitPrice = toNumber(pick(r, ['UNIT_PRICE', 'DON_GIA', 'DONGIA', 'GIA_MUA'])) ?? 0
      const tax = toNumber(pick(r, ['TAX', 'THUE', 'THUE_SUAT', 'TAX_RATE'])) ?? 0
      const currencyRaw = String(
        pick(r, ['CURRENCY', 'TIEN_TE', 'CURRENCY_CODE', 'DON_VI_TIEN_TE']) ?? 'VND'
      ).trim().toUpperCase()
      const currency = currencyRaw || 'VND'
      const exchangeRateRaw =
        toNumber(pick(r, ['EXCHANGE_RATE', 'EXCHANGE', 'TY_GIA', 'TYGIA', 'RATE'])) ?? 1
      const exchangeRate = currency === 'VND' ? 1 : exchangeRateRaw

      const lineId = String(
        pick(r, ['LINE_ID', 'LINEID', 'CLIENT_LINE_ID', 'CLIENTLINEID']) ?? '',
      ).trim()

      return {
        lineId,
        productCode,
        productName: String(pick(r, ['PRODUCT_NAME', 'TEN_HANG', 'TENHANG']) ?? '').trim(),
        vendorCode,
        vendorName: String(pick(r, ['VENDOR_NAME', 'TEN_NCC', 'TENNCC', 'SUPPLIER_NAME']) ?? '').trim(),
        quantity,
        unitPrice,
        currency,
        exchangeRate,
        uom1: String(pick(r, ['UOM1', 'UOM', 'DVT', 'DON_VI_TINH', 'DON_VI']) ?? '').trim(),
        tax,
        quote: String(pick(r, ['QUOTE', 'BAO_GIA', 'BAOGIA']) ?? '').trim(),
        invoice: String(pick(r, ['INVOICE', 'HOA_DON', 'HOADON']) ?? '').trim(),
        receiptWarehouse: String(pick(r, ['RECEIPT_WAREHOUSE', 'RECEIPT_WH', 'NHAP_KHO', 'PHIEU_NHAP_KHO']) ?? '').trim(),
        billOfLadding: String(pick(r, ['BILL_OF_LADING', 'BILL_OF_LADDING', 'BOL', 'BL']) ?? '').trim(),
        trackId: String(pick(r, ['TRACK_ID', 'TRACKID', 'MA_VAN_DON', 'MAVANDON']) ?? '').trim(),
        note: String(pick(r, ['NOTE', 'GHI_CHU', 'GHICHU']) ?? '').trim(),
      }
    })
  }

  const resolveProduct = async (code: string): Promise<IProductResponse | undefined> => {
    if (!code) return undefined
    const cached = productIndex?.[code]
    if (cached?.id) return cached
    const res = await getProductByCode(code)
    return res?.data as IProductResponse
  }

  const resolveVendor = async (code: string): Promise<IVendorResponse | undefined> => {
    if (!code) return undefined
    const cached = vendorIndex?.[code]
    if (cached?.id) return cached
    const res = await getAllVendors({ page: 0, limit: 10, search: code })
    const list = res?.data?.data ?? []
    return list.find((v) => String(v.code).toUpperCase() === code.toUpperCase()) ?? list[0]
  }

  const handleImport = async () => {
    if (!selectedFile) return
    setIsImporting(true)
    try {
      const rows = await parseFile(selectedFile)
      if (!rows.length) {
        toast({ variant: 'destructive', title: 'File rỗng', description: 'Không có dữ liệu để import.' })
        return
      }

      const errors: string[] = []
      const lines: ImportPurchaseLine[] = []

      // resolve unique product/vendor codes
      const productCodes = Array.from(new Set(rows.map(r => r.productCode).filter(Boolean)))
      const vendorCodes = Array.from(new Set(rows.map(r => r.vendorCode).filter(Boolean)))

      const productMap = new Map<string, IProductResponse | undefined>()
      const vendorMap = new Map<string, IVendorResponse | undefined>()

      await Promise.all(productCodes.map(async (c) => {
        try { productMap.set(c, await resolveProduct(c)) } catch { productMap.set(c, undefined) }
      }))
      await Promise.all(vendorCodes.map(async (c) => {
        try { vendorMap.set(c, await resolveVendor(c)) } catch { vendorMap.set(c, undefined) }
      }))

      rows.forEach((r, idx) => {
        const rowNo = idx + 2 // header row = 1
        if (!r.productCode) errors.push(`Dòng ${rowNo}: Thiếu PRODUCT_CODE / MÃ HÀNG`)
        if (!r.vendorCode) errors.push(`Dòng ${rowNo}: Thiếu VENDOR_CODE / MÃ NCC`)
        if (!r.quantity || r.quantity <= 0) errors.push(`Dòng ${rowNo}: QUANTITY phải > 0`)
        if (r.unitPrice < 0) errors.push(`Dòng ${rowNo}: UNIT_PRICE không hợp lệ`)
        if (r.currency !== 'VND' && (!r.exchangeRate || r.exchangeRate <= 0)) {
          errors.push(`Dòng ${rowNo}: EXCHANGE_RATE phải > 0 khi CURRENCY khác VND`)
        }
      })

      if (errors.length) {
        setResult({ totalRows: rows.length, totalSuccess: 0, totalErrors: errors.length, errors })
        return
      }

      rows.forEach((r, idx) => {
        const rowNo = idx + 2
        const product = productMap.get(r.productCode)
        const vendor = vendorMap.get(r.vendorCode)
        if (!product?.id) {
          errors.push(`Dòng ${rowNo}: Không tìm thấy sản phẩm theo mã "${r.productCode}"`)
          return
        }
        if (!vendor?.id) {
          errors.push(`Dòng ${rowNo}: Không tìm thấy NCC theo mã "${r.vendorCode}"`)
          return
        }

        const totalPrice = r.quantity * r.unitPrice
        const totalPriceVnd = r.currency === 'VND' ? totalPrice : totalPrice * r.exchangeRate
        lines.push({
          clientLineId: r.lineId || crypto.randomUUID(),
          id: '',
          purchaseOrderId: '',
          saleOrderLineId: '',
          productId: product.id,
          vendorId: vendor.id,
          saleOrderLine: {
            id: '',
            orderId: '',
            productId: product.id,
            productName: product.name,
            vendorId: vendor.id,
            vendorName: vendor.name,
            productCodeSuggest: product.code,
            productNameSuggest: product.name,
            vendorCodeSuggest: vendor.code,
            vendorNameSuggest: vendor.name,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
            uom: r.uom1 ?? '',
            discountPercent: 0,
            discountAmount: 0,
            isIncludedTax: false,
            taxRate: r.tax ?? 0,
            taxAmount: 0,
            totalAmount: r.quantity * r.unitPrice,
            notes: r.note ?? '',
            receiverNote: '',
            deliveryNote: '',
            referenceNote: '',
            createdAt: '',
            updatedAt: '',
            deletedAt: '',
            createdBy: '',
            updatedBy: '',
          } as IOrderLineResponse,
          product,
          vendor,
          link: '',
          quantity: r.quantity,
          uom1: r.uom1 ?? product.unit1 ?? '',
          uom2: '',
          unitPrice: r.unitPrice,
          isTaxIncluded: false,
          tax: r.tax ?? 0,
          totalBeforeTax: totalPrice,
          totalPrice,
          currency: r.currency,
          exchangeRate: r.exchangeRate,
          totalPriceVnd,
          note: r.note ?? '',
          quote: r.quote ?? '',
          invoice: r.invoice ?? '',
          billOfLadding: r.billOfLadding ?? '',
          receiptWarehouse: r.receiptWarehouse ?? '',
          trackId: r.trackId ?? '',
          purchaseContractNumber: '',
        })
      })

      if (errors.length) {
        setResult({ totalRows: rows.length, totalSuccess: 0, totalErrors: errors.length, errors })
        return
      }

      onImportLines(lines)
      toast({ variant: 'success', title: 'Thao tác thành công', description: `Import ${lines.length} dòng mua hàng` })
      setOpen(false)
      resetState()
    } catch {
      toast({ variant: 'destructive', title: 'Có lỗi xảy ra', description: 'Không đọc được file Excel.' })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className={result ? 'max-w-2xl' : ''}>
        <DialogHeader>
          <DialogTitle>{result ? 'Kết quả import' : 'Import Purchase Order Lines từ Excel'}</DialogTitle>
        </DialogHeader>

        {!result ? (
          <>
            <div className="grid gap-3 py-2">
              <Input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Cột tối thiểu: <b>PRODUCT_CODE</b>, <b>VENDOR_CODE</b>, <b>QUANTITY</b>, <b>UNIT_PRICE</b>.
                Giữ cột <b>LINE_ID</b> từ file xuất để cập nhật đúng dòng (QUOTE, INVOICE, …).
                Các cột khác: CURRENCY, EXCHANGE_RATE, UOM1, TAX, QUOTE, INVOICE, RECEIPT_WAREHOUSE, BILL_OF_LADING, TRACK_ID, NOTE.
              </p>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">Đã chọn: {selectedFile.name}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button onClick={() => void handleImport()} disabled={!selectedFile || isImporting}>
                {isImporting ? 'Đang import...' : 'Import'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">Thành công: {result.totalSuccess}</span>
                <span className="text-red-600">Lỗi: {result.totalErrors}</span>
                <span className="text-muted-foreground">Tổng: {result.totalRows}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Danh sách lỗi ({result.errors.length})
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void handleCopyErrors()}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Sao chép lỗi
                      </>
                    )}
                  </Button>
                </div>

                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-2">
                    {result.errors.map((e, i) => (
                      <div key={i} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                        {e}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setResult(null)}>
                Import lại
              </Button>
              <DialogClose asChild>
                <Button>Đóng</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

