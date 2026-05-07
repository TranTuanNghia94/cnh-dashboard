import HeaderPageLayout from '@/components/layout/HeaderPage'
import { SectionStep } from '@/components/order/order-ui'
import PaymentLinesSection from '@/components/payment/new/payment-lines-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateOrUpdatePaymentRequest, useGetPOLinePaymentHistory, useUploadPaymentRequestFile } from '@/hooks/use-payment'
import { useFindPurchaseOrderLineByDocument } from '@/hooks/use-purchase'
import { useToast } from '@/hooks/use-toast'
import { CURRENCY_OPTIONS } from '@/lib/constants'
import { getCookie, SUB } from '@/lib/cookie'
import { formatCurrencyVN, numberWithCommas, purchaseOrderLineExtendedAmount } from '@/lib/other'
import { ICreateOrUpdatePaymentRequest, IPaymentBankInfoObject, IPaymentFileObject, IPOLinesPaymentHistorySummary, IPaymentRequestFeeRequest, IPaymentRequestItemRequest, IUploadPaymentRequestFileRequest } from '@/types/payment'
import { IFindPurchaseOrderLineByDocumentRequest, IPurchaseOrderLineResponse } from '@/types/purchase'
import { createLazyFileRoute, useBlocker, useRouter } from '@tanstack/react-router'
import { AlertTriangle, BanknoteIcon, CheckCircle2, ClipboardList, Loader2, RefreshCcw, Save, Search } from 'lucide-react'
import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'

type PaymentMode = 'FULL' | 'PARTIAL'

type DocumentType = 'quote' | 'invoice' | 'receiptWarehouse' | 'trackId' | 'billOfLadding'
type PaperFilterType = 'ALL' | DocumentType
const DOCUMENT_TYPE_OPTIONS = [
  { value: 'quote', label: 'Báo giá' },
  { value: 'invoice', label: 'Hóa đơn' },
  { value: 'billOfLadding', label: 'Vận đơn' },
  { value: 'receiptWarehouse', label: 'Phiếu nhập kho' },
  { value: 'trackId', label: 'Track ID' },
] as { value: DocumentType; label: string }[]

const FEE_TYPE_OPTIONS = [
  { value: 'SHIPPING', label: 'Vận chuyển' },
  { value: 'CUSTOMS', label: 'Hải quan' },
  { value: 'INSURANCE', label: 'Bảo hiểm' },
  { value: 'HANDLING', label: 'Bốc xếp' },
  { value: 'OTHER', label: 'Khác' },
]

type PaymentItemWithMeta = IPaymentRequestItemRequest & {
  _id: string
  _documentCodes: Partial<Record<DocumentType, string>>
  _line: IPurchaseOrderLineResponse
}

const emptyBankInfo = (): IPaymentBankInfoObject => ({
  bankName: '',
  accountName: '',
  accountNumber: '',
  swiftCode: '',
  branch: '',
  beneficiaryAddress: '',
  note: '',
})

const emptyFee = (): IPaymentRequestFeeRequest => ({
  feeName: '',
  feeType: 'OTHER',
  amount: 0,
  note: '',
})

const hasAnyBankInfo = (bankInfo: IPaymentBankInfoObject): boolean =>
  Object.values(bankInfo).some((val) => String(val ?? '').trim().length > 0)

const getLinePaperCode = (line: IPurchaseOrderLineResponse, type: DocumentType): string => {
  switch (type) {
    case 'invoice':
      return String(line.invoice ?? '')
    case 'quote':
      return String(line.quote ?? '')
    case 'receiptWarehouse':
      return String(line.receiptWarehouse ?? '')
    case 'trackId':
      return String(line.trackId ?? '')
    case 'billOfLadding':
      return String(line.billOfLadding ?? '')
    default:
      return ''
  }
}

export const Route = createLazyFileRoute('/_app/_wrapper/payment/new')({
  component: NewPaymentPage,
})

function NewPaymentPage() {
  const { mutateAsync: createOrUpdatePaymentRequest, isPending: isCreating } = useCreateOrUpdatePaymentRequest()
  const { mutateAsync: uploadPaymentRequestFile } = useUploadPaymentRequestFile()
  const { mutateAsync: findByDocument, isPending: isFindingByDocument } = useFindPurchaseOrderLineByDocument()
  const { mutateAsync: getPaymentHistory, isPending: isCheckingPaymentHistory } = useGetPOLinePaymentHistory()
  const { toast } = useToast()
  const { history } = useRouter()

  const [currency, setCurrency] = useState('VND')
  const [exchangeRate, setExchangeRate] = useState(1)
  const [approvalLevels, setApprovalLevels] = useState(1)
  const [bankInfo, setBankInfo] = useState<IPaymentBankInfoObject>(emptyBankInfo())
  const [items, setItems] = useState<PaymentItemWithMeta[]>([])
  const [papers, setPapers] = useState<IPaymentFileObject[]>([])
  const [pendingPaperFiles, setPendingPaperFiles] = useState<File[]>([])
  const [fees, setFees] = useState<IPaymentRequestFeeRequest[]>([])
  const [paperFilterType, setPaperFilterType] = useState<PaperFilterType>('ALL')
  const [paperCodeInput, setPaperCodeInput] = useState('')
  const [paperCodeKeyword, setPaperCodeKeyword] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('FULL')
  const [paymentPercentage, setPaymentPercentage] = useState(100)
  const [requestDate, setRequestDate] = useState(moment().format('YYYY-MM-DD'))
  const [paymentHistorySummary, setPaymentHistorySummary] = useState<IPOLinesPaymentHistorySummary | null>(null)

  const isDirty = items.length > 0

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: isDirty,
  })

  const selectedItems = useMemo(() => items, [items])
  const filteredItems = useMemo(() => {
    const keyword = paperCodeKeyword.trim().toLowerCase()
    if (!keyword) return items

    if (paperFilterType === 'ALL') {
      return items.filter((item) =>
        DOCUMENT_TYPE_OPTIONS.some((opt) =>
          getLinePaperCode(item._line, opt.value).toLowerCase().includes(keyword),
        ),
      )
    }

    return items.filter((item) =>
      getLinePaperCode(item._line, paperFilterType).toLowerCase().includes(keyword),
    )
  }, [items, paperFilterType, paperCodeKeyword])

  const selectedItemsWithValidDoc = useMemo(
    () =>
      selectedItems.filter((item) => {
        if (item.selectedDocumentTypes.length === 0) return false
        return item.selectedDocumentTypes.every(
          (docType) => String(item._documentCodes[docType as DocumentType] ?? '').trim().length > 0,
        )
      }),
    [selectedItems],
  )

  const effectivePercentage = paymentMode === 'FULL' ? 100 : paymentPercentage

  /** Sum of original line item amounts (full price before any payments) */
  const originalAmount = useMemo(
    () => paymentHistorySummary?.totalAmount ?? selectedItems.reduce(
      (acc, i) => acc + (purchaseOrderLineExtendedAmount(i._line) || Number(i.requestedAmount ?? 0)),
      0,
    ),
    [selectedItems, paymentHistorySummary],
  )

  /** Total amount already paid */
  const totalPreviouslyPaid = paymentHistorySummary?.totalPaidAmount ?? 0

  const feeAmount = useMemo(() => fees.reduce((acc, f) => acc + Number(f.amount ?? 0), 0), [fees])
  const filteredAmount = useMemo(
    () => filteredItems.reduce(
      (acc, i) => acc + (purchaseOrderLineExtendedAmount(i._line) || Number(i.requestedAmount ?? 0)),
      0,
    ),
    [filteredItems],
  )
  const filteredRequestedAmount = filteredAmount * (effectivePercentage / 100)

  const filteredQuantity = useMemo(
    () => filteredItems.reduce((acc, i) => acc + Number(i._line.quantity ?? 0), 0),
    [filteredItems],
  )

  const canSubmit =
    selectedItems.length > 0 &&
    selectedItemsWithValidDoc.length === selectedItems.length &&
    !isCreating &&
    !isFindingByDocument &&
    !isCheckingPaymentHistory
  const hasLoadedLines = items.length > 0

  const missingRequirements = useMemo(() => {
    const issues: string[] = []
    if (selectedItems.length === 0) issues.push('Tìm và tải ít nhất 1 dòng PO theo chứng từ')
    if (selectedItems.length > 0 && selectedItemsWithValidDoc.length !== selectedItems.length) {
      issues.push('Kiểm tra lại chứng từ/mã chứng từ của các dòng PO')
    }
    return issues
  }, [selectedItems.length, selectedItemsWithValidDoc.length])

  const hasPaymentHistory = paymentHistorySummary && paymentHistorySummary.paymentRequests.length > 0

  const handleAddFee = useCallback(() => {
    setFees((prev) => [...prev, emptyFee()])
  }, [])

  const handleRemoveFee = useCallback((index: number) => {
    setFees((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateFee = useCallback((index: number, field: keyof IPaymentRequestFeeRequest, value: string | number) => {
    setFees((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)))
  }, [])

  const handleUpdateBankInfo = useCallback((field: keyof IPaymentBankInfoObject, value: string) => {
    setBankInfo((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleClearDocumentFilter = useCallback(() => {
    setPaperFilterType('ALL')
    setPaperCodeInput('')
    setPaperCodeKeyword('')
  }, [])

  const handleUploadPapers = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const uploadedAt = new Date().toISOString()
    const uploadedBy = getCookie(SUB) ?? 'unknown'
    const selectedFiles = Array.from(files)
    const mapped: IPaymentFileObject[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      viewUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      contentType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt,
      uploadedBy,
      category: 'PAYMENT_PAPER',
    }))
    setPapers((prev) => [...prev, ...mapped])
    setPendingPaperFiles((prev) => [...prev, ...selectedFiles])
  }, [])

  const handleRemovePaper = useCallback((index: number) => {
    setPapers((prev) => prev.filter((_, i) => i !== index))
    setPendingPaperFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSearchPaperCode = useCallback(async () => {
    try {
      const keyword = paperCodeInput.trim()
      if (!keyword) {
        toast({
          variant: 'destructive',
          title: 'Thiếu dữ liệu tìm kiếm',
          description: 'Vui lòng nhập số / mã chứng từ để tìm.',
        })
        return
      }
      if (paperFilterType === 'ALL') {
        toast({
          variant: 'destructive',
          title: 'Thiếu loại chứng từ',
          description: 'Vui lòng chọn loại chứng từ cụ thể để tìm.',
        })
        return
      }

      const payload: IFindPurchaseOrderLineByDocumentRequest = {
        paperCode: keyword,
        paperType: paperFilterType,
      }
      const res = await findByDocument(payload)
      const lines = Array.isArray(res?.data)
        ? (res.data as IPurchaseOrderLineResponse[])
        : Array.isArray(res)
          ? (res as unknown as IPurchaseOrderLineResponse[])
          : []

      if (lines.length === 0) {
        setItems([])
        setPaymentHistorySummary(null)
        toast({
          title: 'Không tìm thấy',
          description: 'Không tìm thấy dòng PO theo điều kiện chứng từ.',
          variant: 'destructive',
        })
        setPaperCodeKeyword(keyword)
        return
      }

      let historySummary: IPOLinesPaymentHistorySummary | null = null

      try {
        const historyRes = await getPaymentHistory({ paperCode: keyword, paperType: paperFilterType })
        if (historyRes?.data) {
          historySummary = historyRes.data
        }
      } catch {
        // Continue without payment history if API fails
      }

      setPaymentHistorySummary(historySummary)

      const newItems = lines.map((line) => ({
        _id: crypto.randomUUID(),
        _documentCodes: { [paperFilterType]: keyword },
        _line: line,
        purchaseOrderLineId: line.id,
        selectedDocumentTypes: [paperFilterType],
        requestedAmount: purchaseOrderLineExtendedAmount(line) || Number(line.totalPrice ?? 0),
        note: '',
      }))

      setItems(newItems)

      let description = `Tìm thấy ${lines.length} dòng PO phù hợp`
      const hasPaymentRequests = historySummary && historySummary.paymentRequests.length > 0
      if (hasPaymentRequests && historySummary) {
        const paidPct = historySummary.paidPercentage ?? 0
        if (paidPct > 0 && paidPct < 100) {
          description += `. Đã thanh toán ${paidPct.toFixed(1)}% - số tiền còn lại: ${numberWithCommas(historySummary.totalRemainingAmount)}.`
        } else if (paidPct >= 100) {
          description += `. Đã thanh toán đầy đủ 100%.`
        }
      }

      toast({
        title: 'Đã tải dữ liệu',
        description,
        variant: hasPaymentRequests ? 'warning' : 'success',
      })
      setPaperCodeKeyword(keyword)
    } catch {
      // handled by hook
    }
  }, [paperCodeInput, paperFilterType, findByDocument, getPaymentHistory, toast])

  const handleReset = useCallback(() => {
    setItems([])
    setFees([])
    setCurrency('VND')
    setExchangeRate(1)
    setApprovalLevels(1)
    setBankInfo(emptyBankInfo())
    setPaperCodeInput('')
    setPaperCodeKeyword('')
    setPapers([])
    setPendingPaperFiles([])
    setPaymentMode('FULL')
    setPaymentPercentage(100)
    setPaymentHistorySummary(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    const paidPct = paymentMode === 'FULL' ? 100 : paymentPercentage
    const lineAmountTotal = selectedItems.reduce(
      (acc, i) => acc + (purchaseOrderLineExtendedAmount(i._line) || Number(i.requestedAmount ?? 0)),
      0,
    )
    const remainingLineAmount = paymentHistorySummary?.totalRemainingAmount ?? lineAmountTotal
    const feeSum = fees.reduce((acc, f) => acc + Number(f.amount ?? 0), 0)
    const requestedSum = remainingLineAmount * (paidPct / 100)

    const prevPaidNote = paymentHistorySummary && paymentHistorySummary.totalPaidAmount > 0
      ? `[PREV_PAID: ${paymentHistorySummary.totalPaidAmount} (${paymentHistorySummary.paidPercentage}%)]`
      : ''

    const body: ICreateOrUpdatePaymentRequest = {
      requestorId: getCookie(SUB) ?? '',
      requestDate: `${requestDate || moment().format('YYYY-MM-DD')}T00:00:00.000Z`,
      currency,
      exchangeRate,
      purpose: filteredItems?.[0]._line.vendor.code,
      notes: [paperCodeInput?.trim() ?? '', prevPaidNote].filter(Boolean).join('\n'),
      paidPercentage: paidPct,
      papers,
      bankInfo: hasAnyBankInfo(bankInfo) ? bankInfo : undefined,
      approvalLevels,
      items: selectedItems.map((i) => {
        const itemAmount = purchaseOrderLineExtendedAmount(i._line) || Number(i.requestedAmount ?? 0)
        const itemRequestedAmount = itemAmount * (paidPct / 100)

        return {
          purchaseOrderLineId: i.purchaseOrderLineId,
          selectedDocumentTypes: i.selectedDocumentTypes,
          requestedAmount: itemRequestedAmount,
          note: (() => {
            const docRefs = i.selectedDocumentTypes
              .map((docType) => {
                const code = String(i._documentCodes[docType as DocumentType] ?? '').trim()
                if (!code) return null
                return `${docType}:${code}`
              })
              .filter(Boolean)
              .join(' | ')

            const baseNote = i.note.trim()
            return [baseNote, docRefs ? `[DOCS] ${docRefs}` : ''].filter(Boolean).join('\n')
          })(),
        }
      }),
      fees,
      amount: remainingLineAmount,
      feeAmount: feeSum,
      requestedAmount: requestedSum,
      totalAmount: requestedSum + feeSum,
    }
    const created = await createOrUpdatePaymentRequest(body)
    const paymentRequestId = created?.data?.id

    if (paymentRequestId && pendingPaperFiles.length > 0) {
      const uploadPayloads: IUploadPaymentRequestFileRequest[] = pendingPaperFiles.map((file) => ({
        file,
        category: 'PAYMENT_PAPER',
        paymentRequestId,
        attachmentType: 'PAPER',
      }))
      await Promise.all(uploadPayloads.map((payload) => uploadPaymentRequestFile(payload)))
    }

    toast({ title: 'Thao tác thành công', description: 'Tạo đề nghị thanh toán thành công', variant: 'success' })
    history.back()
  }, [
    canSubmit,
    createOrUpdatePaymentRequest,
    requestDate,
    currency,
    exchangeRate,
    papers,
    bankInfo,
    approvalLevels,
    selectedItems,
    filteredItems,
    paperCodeInput,
    fees,
    paymentMode,
    paymentPercentage,
    paymentHistorySummary,
    pendingPaperFiles,
    uploadPaymentRequestFile,
    toast,
    history,
  ])

  const stepItems = useMemo(
    () => [
      {
        icon: ClipboardList,
        label: 'Chọn đơn mua hàng',
        helper: items.length > 0 ? `Đã tải ${items.length} dòng PO` : 'Chọn loại chứng từ và mã để tải & lọc',
        state: (items.length > 0 ? 'done' : 'current') as 'done' | 'current' | 'pending',
      },
      {
        icon: BanknoteIcon,
        label: 'Thông tin thanh toán',
        helper: 'Điền mục đích, tiền tệ, tỷ giá',
        state: (items.length > 0 ? 'current' : 'pending') as 'done' | 'current' | 'pending',
      },
      {
        icon: CheckCircle2,
        label: 'Dòng thanh toán',
        helper:
          selectedItemsWithValidDoc.length > 0
            ? `${selectedItemsWithValidDoc.length}/${selectedItems.length} dòng có chứng từ hợp lệ`
            : 'Chọn các dòng cần thanh toán',
        state: (selectedItems.length > 0 && selectedItemsWithValidDoc.length === selectedItems.length ? 'done' : items.length > 0 ? 'current' : 'pending') as 'done' | 'current' | 'pending',
      },
      {
        icon: Save,
        label: 'Xác nhận & lưu',
        helper: canSubmit ? 'Sẵn sàng tạo đề nghị' : 'Hoàn tất các bước trên',
        state: (canSubmit ? 'done' : 'pending') as 'done' | 'current' | 'pending',
      },
    ],
    [items.length, selectedItems.length, selectedItemsWithValidDoc.length, canSubmit],
  )

  return (
    <div className="pb-28">
      <HeaderPageLayout title="Tạo đề nghị thanh toán" buttonSubmit={<></>} />

      {/* Steps */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stepItems.map((step) => (
          <SectionStep key={step.label} icon={step.icon} label={step.label} helper={step.helper} state={step.state} />
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase">Đơn mua hàng (PO)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 rounded-md border bg-muted/30 p-3">
                <div className="rounded border bg-background px-2 py-1.5 text-[11px] text-muted-foreground">
                  Bước 1: Chọn <span className="font-medium">Loại chứng từ</span> + nhập <span className="font-medium">Số/mã</span>, sau đó bấm <span className="font-medium">Tìm</span>.
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Loại chứng từ</Label>
                  <Select value={paperFilterType} onValueChange={(v) => setPaperFilterType(v as PaperFilterType)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
                      <SelectItem value="invoice" className="text-xs">INVOICE</SelectItem>
                      <SelectItem value="quote" className="text-xs">QUOTE</SelectItem>
                      <SelectItem value="receiptWarehouse" className="text-xs">RECEIPT WAREHOUSE</SelectItem>
                      <SelectItem value="trackId" className="text-xs">Track ID</SelectItem>
                      <SelectItem value="billOfLadding" className="text-xs">BILL OF LADING</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nhập số / mã chứng từ</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Nhập mã để tìm dòng PO..."
                      value={paperCodeInput}
                      onChange={(e) => setPaperCodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          void handleSearchPaperCode()
                        }
                      }}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => void handleSearchPaperCode()} disabled={isFindingByDocument || isCheckingPaymentHistory} className="h-8">
                      {(isFindingByDocument || isCheckingPaymentHistory) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span className="ml-1">{isFindingByDocument ? 'Đang tìm' : isCheckingPaymentHistory ? 'Đang kiểm tra' : 'Tìm'}</span>
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={handleClearDocumentFilter} disabled={isFindingByDocument} className="h-8">
                      Xóa lọc
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Chọn loại chứng từ + nhập mã, sau đó bấm <span className="font-medium">Tìm</span>.
                </p>
                {missingRequirements.length > 0 && (
                  <div className="rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                    Cần hoàn tất: {missingRequirements.join(' • ')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={!hasLoadedLines ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pointer-events-auto">
              {!hasLoadedLines && (
                <div className="rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                  Khóa tạm: Vui lòng hoàn tất Bước 1 (tìm dòng PO theo chứng từ) trước.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">
                    Tiền tệ <span className="text-red-500">*</span>
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tỷ giá</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className="h-8 text-xs"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    disabled={currency === 'VND' || !hasLoadedLines}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Hạn thanh toán <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Số cấp duyệt</Label>
                <Select
                  value={String(approvalLevels)}
                  onValueChange={(v) => setApprovalLevels(Number(v))}
                  disabled={!hasLoadedLines}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3].map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-xs">
                        {n} cấp
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Hình thức thanh toán <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={paymentMode}
                  onValueChange={(v) => {
                    setPaymentMode(v as PaymentMode)
                    if (v === 'FULL') setPaymentPercentage(100)
                  }}
                  disabled={!hasLoadedLines}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="FULL" id="pay-full" />
                    <Label htmlFor="pay-full" className="text-xs font-normal cursor-pointer">
                      Thanh toán toàn bộ (100%)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="PARTIAL" id="pay-partial" />
                    <Label htmlFor="pay-partial" className="text-xs font-normal cursor-pointer">
                      Thanh toán một phần
                    </Label>
                  </div>
                </RadioGroup>
                {paymentMode === 'PARTIAL' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      className="h-8 w-24 text-xs tabular-nums"
                      value={paymentPercentage}
                      onChange={(e) => {
                        const v = Math.min(100, Math.max(0, Number(e.target.value)))
                        setPaymentPercentage(v)
                      }}
                      disabled={!hasLoadedLines}
                    />
                    <span className="text-xs text-muted-foreground">% tổng giá trị đơn hàng</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={!hasLoadedLines ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase">Thông tin ngân hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(
                [
                  { field: 'bankName', label: 'Tên ngân hàng' },
                  { field: 'accountName', label: 'Tên tài khoản' },
                  { field: 'accountNumber', label: 'Số tài khoản' },
                  { field: 'branch', label: 'Chi nhánh' },
                ] as { field: keyof IPaymentBankInfoObject; label: string }[]
              ).map(({ field, label }) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    className="h-8 text-xs"
                    value={bankInfo[field]}
                    onChange={(e) => handleUpdateBankInfo(field, e.target.value)}
                    disabled={!hasLoadedLines}
                  />
                </div>
              ))}
            </CardContent>


            {hasPaymentHistory && (
              <div className="rounded border border-blue-300 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Lịch sử thanh toán</span>
                </div>
                <p className="mb-2">
                  Các dòng PO này đã có {paymentHistorySummary!.paymentRequests.length} đề nghị thanh toán trước đó. Số tiền đề nghị lần này sẽ tính trên phần còn lại.
                </p>
                <div className="space-y-1">
                  {paymentHistorySummary!.paymentRequests.map((pr) => (
                    <div key={pr.paymentRequestId} className="flex items-center justify-between gap-2 rounded bg-white/50 px-2 py-1">
                      <span className="truncate flex-1 font-medium">
                        {pr.paymentRequestNumber}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={pr.status === 'PAID' ? 'default' : 'outline'} className="text-[10px]">
                          {pr.status}
                        </Badge>
                        <span className="text-[10px]">
                          {numberWithCommas(pr.requestedAmount)} {pr.currency}
                        </span>
                        {pr.paidAmount > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            Đã TT: {numberWithCommas(pr.paidAmount)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-blue-200 space-y-1">
                  <div className="flex justify-between">
                    <span>Tổng giá trị:</span>
                    <span className="font-medium">{numberWithCommas(filteredAmount)} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đã thanh toán ({paymentHistorySummary.paymentRequests.reduce((acc, pr) => acc + pr.paidPercentage, 0)}%):</span>
                    <span className="font-medium text-amber-700">{numberWithCommas(paymentHistorySummary.paymentRequests.reduce((acc, pr) => acc + pr.requestedAmount, 0))} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Còn lại cần thanh toán:</span>
                    <span className="font-bold text-blue-700">{filteredAmount - paymentHistorySummary.paymentRequests.reduce((acc, pr) => acc + pr.requestedAmount, 0)} {currency}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
        <PaymentLinesSection
          items={items}
          filteredItems={filteredItems}
          papers={papers}
          fees={fees}
          hasLoadedLines={hasLoadedLines}
          filteredQuantity={filteredQuantity}
          filteredRequestedAmountRaw={filteredAmount}
          filteredRequestedAmount={filteredRequestedAmount}
          effectivePercentage={effectivePercentage}
          paymentMode={paymentMode}
          currency={currency}
          feeTypeOptions={FEE_TYPE_OPTIONS}
          onUploadPapers={handleUploadPapers}
          onRemovePaper={handleRemovePaper}
          onAddFee={handleAddFee}
          onRemoveFee={handleRemoveFee}
          onUpdateFee={handleUpdateFee}
          numberWithCommas={numberWithCommas}
        />
      </div>

      {/* Fixed Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Đơn mua hàng</span>
              <span className="font-medium text-foreground">
                {items.length > 0 ? `${items.length} dòng PO` : '—'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Hình thức</span>
              <span className="font-medium text-foreground">
                {paymentMode === 'FULL' ? 'Toàn bộ' : `${effectivePercentage}%`}
              </span>
            </div>
            {totalPreviouslyPaid > 0 && (
              <>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase text-muted-foreground">Tổng giá trị gốc</span>
                  <span className="font-medium text-muted-foreground tabular-nums line-through">
                    {numberWithCommas(originalAmount)} {currency}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase text-muted-foreground">Đã TT trước</span>
                  <span className="font-medium text-amber-600 tabular-nums">
                    {numberWithCommas(paymentHistorySummary?.totalPaidAmount ?? 0)} {currency}
                  </span>
                </div>
              </>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">
                {totalPreviouslyPaid > 0 ? 'Còn lại cần TT' : 'Tiền hàng (tổng dòng)'}
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {numberWithCommas(filteredAmount - (paymentHistorySummary?.totalPaidAmount ?? 0))} {currency}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Đề nghị thanh toán ({effectivePercentage}%)</span>
              <span className="font-semibold text-foreground tabular-nums">
                {numberWithCommas(filteredAmount * (effectivePercentage / 100))} {currency}
              </span>
            </div>
            {feeAmount > 0 && (
              <div className="flex flex-col">
                <span className="text-[11px] uppercase text-muted-foreground">Tổng phí</span>
                <span className="font-medium text-foreground tabular-nums">
                  {numberWithCommas(feeAmount)} {currency}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tổng cộng (VND)</span>
              <span className="font-bold text-primary tabular-nums">
                {formatCurrencyVN(((filteredAmount * (effectivePercentage / 100)) + feeAmount) * exchangeRate)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Ngày tạo</span>
              <span className="font-medium text-foreground">{moment().format('DD/MM/YYYY')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isCreating}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button type="button" size="sm" disabled={!canSubmit || isCreating} onClick={handleSubmit}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Tạo đề nghị thanh toán
                </>
              )}
            </Button>
            {!canSubmit && !isCreating && (
              <span className="text-[11px] text-muted-foreground">
                Chưa thể tạo: {missingRequirements[0] ?? 'Vui lòng kiểm tra dữ liệu'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
