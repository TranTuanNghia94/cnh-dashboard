import HeaderPageLayout from '@/components/layout/HeaderPage'
import { SectionStep } from '@/components/order/order-ui'
import PaymentLinesSection from '@/components/payment/new/payment-lines-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateOrUpdatePaymentRequest } from '@/hooks/use-payment'
import { useFindPurchaseOrderLineByDocument } from '@/hooks/use-purchase'
import { useToast } from '@/hooks/use-toast'
import { getCookie, SUB } from '@/lib/cookie'
import { formatCurrencyVN, numberWithCommas, purchaseOrderLineExtendedAmount } from '@/lib/other'
import { ICreateOrUpdatePaymentRequest, IPaymentBankInfoObject, IPaymentFileObject, IPaymentRequestFeeRequest, IPaymentRequestItemRequest } from '@/types/payment'
import { IFindPurchaseOrderLineByDocumentRequest, IPurchaseOrderLineResponse } from '@/types/purchase'
import { createLazyFileRoute, useBlocker, useRouter } from '@tanstack/react-router'
import { BanknoteIcon, CheckCircle2, ClipboardList, Loader2, RefreshCcw, Save, Search } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'

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

const CURRENCY_OPTIONS = ['VND', 'USD', 'EUR', 'CNY', 'JPY']

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
  const { mutateAsync: createOrUpdatePaymentRequest, isPending: isCreating, isSuccess, data: createdData } = useCreateOrUpdatePaymentRequest()
  const { mutateAsync: findByDocument, isPending: isFindingByDocument } = useFindPurchaseOrderLineByDocument()
  const { toast } = useToast()
  const { history } = useRouter()

  const [currency, setCurrency] = useState('VND')
  const [exchangeRate, setExchangeRate] = useState(1)
  const [approvalLevels, setApprovalLevels] = useState(1)
  const [bankInfo, setBankInfo] = useState<IPaymentBankInfoObject>(emptyBankInfo())
  const [items, setItems] = useState<PaymentItemWithMeta[]>([])
  const [papers, setPapers] = useState<IPaymentFileObject[]>([])
  const [fees, setFees] = useState<IPaymentRequestFeeRequest[]>([])
  const [paperFilterType, setPaperFilterType] = useState<PaperFilterType>('ALL')
  const [paperCodeInput, setPaperCodeInput] = useState('')
  const [paperCodeKeyword, setPaperCodeKeyword] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('FULL')
  const [paymentPercentage, setPaymentPercentage] = useState(100)
  const [requestDate, setRequestDate] = useState(moment().format('YYYY-MM-DD'))

  const isDirty = items.length > 0

  useBlocker({
    blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
    condition: isDirty && !isSuccess,
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

  /** Sum of line item amounts only (no fees) — same as SL × đơn giá per dòng when PO line has qty & price. */
  const amount = useMemo(
    () =>
      selectedItems.reduce(
        (acc, i) => acc + (purchaseOrderLineExtendedAmount(i._line) || Number(i.requestedAmount ?? 0)),
        0,
      ),
    [selectedItems],
  )
  const feeAmount = useMemo(() => fees.reduce((acc, f) => acc + Number(f.amount ?? 0), 0), [fees])
  /** Portion of `amount` to pay (full or partial %). */
  const requestedAmount = amount * (effectivePercentage / 100)
  const totalAmount = requestedAmount + feeAmount
  const totalAmountVnd = currency === 'VND' ? totalAmount : totalAmount * exchangeRate

  const filteredAmount = useMemo(
    () =>
      filteredItems.reduce(
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
    !isFindingByDocument
  const hasLoadedLines = items.length > 0

  const missingRequirements = useMemo(() => {
    const issues: string[] = []
    if (selectedItems.length === 0) issues.push('Tìm và tải ít nhất 1 dòng PO theo chứng từ')
    if (selectedItems.length > 0 && selectedItemsWithValidDoc.length !== selectedItems.length) {
      issues.push('Kiểm tra lại chứng từ/mã chứng từ của các dòng PO')
    }
    return issues
  }, [selectedItems.length, selectedItemsWithValidDoc.length])

  useEffect(() => {
    if (createdData && isSuccess) {
      toast({ title: 'Thao tác thành công', description: 'Tạo đề nghị thanh toán thành công', variant: 'success' })
      history.back()
    }
  }, [isSuccess, createdData, toast, history])

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
    const mapped: IPaymentFileObject[] = Array.from(files).map((file) => ({
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      contentType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt,
      uploadedBy,
      category: 'PAYMENT_PAPER',
    }))
    setPapers((prev) => [...prev, ...mapped])
  }, [])

  const handleRemovePaper = useCallback((index: number) => {
    setPapers((prev) => prev.filter((_, i) => i !== index))
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

      setItems(
        lines.map((line) => ({
          _id: crypto.randomUUID(),
          _documentCodes: { [paperFilterType]: keyword },
          _line: line,
          purchaseOrderLineId: line.id,
          selectedDocumentTypes: [paperFilterType],
          requestedAmount: purchaseOrderLineExtendedAmount(line) || Number(line.totalPrice ?? 0),
          note: '',
        })),
      )
      toast({
        title: 'Đã tải dữ liệu',
        description: lines.length > 0
          ? `Tìm thấy ${lines.length} dòng PO phù hợp`
          : 'Không tìm thấy dòng PO theo điều kiện chứng từ.',
        variant: 'success',
      })
      setPaperCodeKeyword(keyword)
    } catch {
      // handled by hook
    }
  }, [paperCodeInput, paperFilterType, findByDocument, toast])

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
    setPaymentMode('FULL')
    setPaymentPercentage(100)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    const paidPct = paymentMode === 'FULL' ? 100 : paymentPercentage
    const lineAmount = selectedItems.reduce(
      (acc, i) => acc + (purchaseOrderLineExtendedAmount(i._line) || Number(i.requestedAmount ?? 0)),
      0,
    )
    const feeSum = fees.reduce((acc, f) => acc + Number(f.amount ?? 0), 0)
    const requestedSum = lineAmount * (paidPct / 100)
    const body: ICreateOrUpdatePaymentRequest = {
      requestorId: getCookie(SUB) ?? '',
      requestDate: `${requestDate || moment().format('YYYY-MM-DD')}T00:00:00.000Z`,
      currency,
      exchangeRate,
      purpose: filteredItems?.[0]._line.vendor.code,
      notes: paperCodeInput?.trim() ?? '',
      paidPercentage: paidPct,
      papers,
      bankInfo: hasAnyBankInfo(bankInfo) ? bankInfo : undefined,
      approvalLevels,
      items: selectedItems.map((i) => ({
        purchaseOrderLineId: i.purchaseOrderLineId,
        selectedDocumentTypes: i.selectedDocumentTypes,
        requestedAmount: i.requestedAmount,
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
          if (!docRefs) return baseNote
          return baseNote ? `${baseNote}\n[DOCS] ${docRefs}` : `[DOCS] ${docRefs}`
        })(),
      })),
      fees,
      amount: lineAmount,
      feeAmount: feeSum,
      requestedAmount: requestedSum,
      totalAmount: requestedSum + feeSum,
    }
    await createOrUpdatePaymentRequest(body)
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
                    <Button type="button" size="sm" variant="outline" onClick={() => void handleSearchPaperCode()} disabled={isFindingByDocument} className="h-8">
                      {isFindingByDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span className="ml-1">{isFindingByDocument ? 'Đang tìm' : 'Tìm'}</span>
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
                    {[1, 2, 3].map((n) => (
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
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Tiền hàng (tổng dòng)</span>
              <span className="font-medium text-foreground tabular-nums">
                {numberWithCommas(amount)} {currency}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase text-muted-foreground">Đề nghị thanh toán ({effectivePercentage}%)</span>
              <span className="font-semibold text-foreground tabular-nums">
                {numberWithCommas(requestedAmount)} {currency}
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
                {formatCurrencyVN(totalAmountVnd)}
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
