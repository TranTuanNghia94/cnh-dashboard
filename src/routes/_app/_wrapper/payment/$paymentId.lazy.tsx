import HeaderPageLayout from '@/components/layout/HeaderPage'
import { SectionStep } from '@/components/order/order-ui'
import PaymentLinesViewSection from '@/components/payment/update/payment-lines-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateOrUpdatePaymentRequest, useGetPaymentRequestById } from '@/hooks/use-payment'
import { useToast } from '@/hooks/use-toast'
import { CURRENCY_OPTIONS, PAYMENT_REQUEST_FEE_TYPE_OPTIONS, PaymentMode } from '@/lib/constants'
import { getCookie, SUB } from '@/lib/cookie'
import { formatCurrencyVN, numberWithCommas, purchaseOrderLineExtendedAmount } from '@/lib/other'
import {
    ICreateOrUpdatePaymentRequest,
    IPaymentBankInfoObject,
    IPaymentFileObject,
    IPaymentRequestFeeInfo,
    IPaymentRequestFeeRequest,
    IPaymentRequestInfo,
    IPaymentRequestItemRequest,
    IPaymentRequestLineInfo,
} from '@/types/payment'
import { IPurchaseOrderLineResponse } from '@/types/purchase'
import { createLazyFileRoute, useBlocker, useParams, useRouter } from '@tanstack/react-router'
import { BanknoteIcon, CheckCircle2, ClipboardList, Loader2, RefreshCcw, Save } from 'lucide-react'
import moment from 'moment'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'




type PaymentItemView = IPaymentRequestItemRequest & {
    _id: string
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

const BANK_FIELDS: { field: keyof IPaymentBankInfoObject; label: string }[] = [
    { field: 'bankName', label: 'Tên ngân hàng' },
    { field: 'accountName', label: 'Tên tài khoản' },
    { field: 'accountNumber', label: 'Số tài khoản' },
    { field: 'swiftCode', label: 'SWIFT / BIC' },
    { field: 'branch', label: 'Chi nhánh' },
    { field: 'beneficiaryAddress', label: 'Địa chỉ thụ hưởng' },
]

const parseSelectedDocumentTypes = (selectedDocuments?: string): string[] => {
    const raw = String(selectedDocuments ?? '').trim()
    if (!raw) return []
    return raw
        .split(/[\n,|]/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => {
            const token = item.startsWith('[DOCS]') ? item.replace('[DOCS]', '').trim() : item
            return token.includes(':') ? token.split(':')[0]?.trim() ?? '' : token
        })
        .filter(Boolean)
}

const mapFees = (list: IPaymentRequestFeeInfo[] | undefined): IPaymentRequestFeeRequest[] =>
    (list ?? []).map((f) => ({
        feeName: f.feeName ?? '',
        feeType: f.feeType ?? 'OTHER',
        amount: Number(f.amount ?? 0),
        note: f.note ?? '',
    }))

const mapItems = (lines: IPaymentRequestLineInfo[] | undefined): PaymentItemView[] =>
    (lines ?? []).map((line) => {
        const po = line.purchaseOrderLine
        const amt = po ? purchaseOrderLineExtendedAmount(po) : Number(line.requestedAmount ?? 0)
        return {
            _id: crypto.randomUUID(),
            purchaseOrderLineId: line.purchaseOrderLineId,
            requestedAmount: amt,
            note: line.note ?? '',
            selectedDocumentTypes: parseSelectedDocumentTypes(line.selectedDocuments),
            _line: line.purchaseOrderLine as IPurchaseOrderLineResponse,
        }
    })

function FooterStat({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col">
            <span className="text-[11px] uppercase text-muted-foreground">{label}</span>
            {children}
        </div>
    )
}

export const Route = createLazyFileRoute('/_app/_wrapper/payment/$paymentId')({
    component: PaymentDetailPage,
})

function PaymentDetailPage() {
    const { paymentId } = useParams({ strict: false })
    const { history } = useRouter()
    const { toast } = useToast()
    const { mutateAsync: getById, isPending: isLoading } = useGetPaymentRequestById()
    const { mutateAsync: savePayment, isPending: isSaving } = useCreateOrUpdatePaymentRequest()

    const [paymentData, setPaymentData] = useState<IPaymentRequestInfo>()
    const [currency, setCurrency] = useState('VND')
    const [exchangeRate, setExchangeRate] = useState(1)
    const [purpose, setPurpose] = useState('')
    const [approvalLevels, setApprovalLevels] = useState(1)
    const [bankInfo, setBankInfo] = useState<IPaymentBankInfoObject>(emptyBankInfo())
    const [fees, setFees] = useState<IPaymentRequestFeeRequest[]>([])
    const [papers, setPapers] = useState<IPaymentFileObject[]>([])
    const [items, setItems] = useState<PaymentItemView[]>([])
    const [requestDate, setRequestDate] = useState('')
    const [isDirty, setIsDirty] = useState(false)
    const [paymentPercentage, setPaymentPercentage] = useState(100)

    const touch = useCallback(() => setIsDirty(true), [])

    // Không dùng `isDirty && !isSaving`: khi đang lưu `isSaving` = true làm điều kiện false → blocker tắt, router có thể chuyển trang (vd. /payment) giữa lúc gọi API.
    useBlocker({
        blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
        condition: isDirty || isSaving,
    })

    const loadData = useCallback(async () => {
        if (!paymentId) return
        const data = (await getById(paymentId))?.data as IPaymentRequestInfo | undefined
        if (!data) return

        setPaymentData(data)
        setCurrency(data.currency ?? 'VND')
        setExchangeRate(Number(data.exchangeRate ?? 1))
        setPurpose(data.purpose ?? '')
        setApprovalLevels(Number(data.approvalLevels ?? 1))
        setBankInfo(data.bankInfo ?? emptyBankInfo())
        setPapers(data.papers ?? [])
        setFees(mapFees(data.fees))
        setItems(mapItems(data.items))
        setRequestDate(data.requestDate ? moment(data.requestDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'))
        setPaymentPercentage(data.paidPercentage ?? 100)
        setIsDirty(false)
    }, [getById, paymentId])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const stats = useMemo(() => {
        const amount = items.reduce((a, i) => a + Number(i.requestedAmount ?? 0), 0)
        const feeAmount = fees.reduce((a, f) => a + Number(f.amount ?? 0), 0)
        const filteredQuantity = items.reduce((a, i) => a + Number(i._line.quantity ?? 0), 0)
        const paymentMode: PaymentMode = paymentPercentage === 100 ? 'FULL' : 'PARTIAL'
        const requestedAmount = amount * (paymentPercentage / 100)
        const totalAmount = requestedAmount + feeAmount
        const totalAmountVnd = currency === 'VND' ? totalAmount : totalAmount * exchangeRate
        return { amount, feeAmount, filteredQuantity, paymentMode, requestedAmount, totalAmountVnd }
    }, [items, fees, paymentPercentage, currency, exchangeRate])

    const { amount, feeAmount, filteredQuantity, paymentMode, requestedAmount, totalAmountVnd } = stats
    const hasLoadedLines = items.length > 0

    const stepItems = useMemo(
        () => [
            { icon: ClipboardList, label: 'Đơn mua hàng', helper: hasLoadedLines ? `${items.length} dòng PO` : 'Không có dòng thanh toán', state: hasLoadedLines ? 'done' : 'current' },
            { icon: BanknoteIcon, label: 'Thông tin thanh toán', helper: purpose || 'Điền mục đích, tiền tệ, tỷ giá', state: purpose.trim() ? 'done' : hasLoadedLines ? 'current' : 'pending' },
            { icon: CheckCircle2, label: 'Phí & chứng từ', helper: `${fees.length} phí • ${papers.length} chứng từ`, state: hasLoadedLines ? 'current' : 'pending' },
            { icon: Save, label: 'Xác nhận & lưu', helper: isDirty ? 'Có thay đổi chưa lưu' : 'Không có thay đổi mới', state: isDirty ? 'current' : 'pending' },
        ] as const,
        [hasLoadedLines, items.length, purpose, fees.length, papers.length, isDirty],
    )

    const handleSubmit = useCallback(async () => {
        if (!paymentData?.id || !purpose.trim()) return
        const lineAmount = items.reduce((a, i) => a + Number(i.requestedAmount ?? 0), 0)
        const feeSum = fees.reduce((a, f) => a + Number(f.amount ?? 0), 0)
        const requestedSum = lineAmount * (paymentPercentage / 100)
        const payload: ICreateOrUpdatePaymentRequest = {
            id: paymentData.id,
            requestorId: paymentData.requestorId || getCookie(SUB) || '',
            currency,
            exchangeRate: Number(exchangeRate ?? 1),
            requestDate: `${requestDate || moment().format('YYYY-MM-DD')}T00:00:00.000Z`,
            purpose: purpose.trim(),
            paidPercentage: paymentPercentage,
            notes: paymentData.notes ?? '',
            papers,
            bankInfo,
            approvalLevels: Number(approvalLevels ?? 1),
            items: items.map((i) => ({
                purchaseOrderLineId: i.purchaseOrderLineId,
                requestedAmount: i.requestedAmount,
                note: i.note,
                selectedDocumentTypes: i.selectedDocumentTypes,
            })),
            fees,
            amount: lineAmount,
            feeAmount: feeSum,
            requestedAmount: requestedSum,
            totalAmount: requestedSum + feeSum,
        }
        try {
            await savePayment(payload)
            toast({ title: 'Thao tác thành công', description: 'Đã cập nhật đề nghị thanh toán.', variant: 'success' })
            await loadData()
        } catch {
            // Lỗi đã toast trong hook mutation
        }
    }, [
        paymentData,
        purpose,
        currency,
        exchangeRate,
        requestDate,
        paymentPercentage,
        papers,
        bankInfo,
        approvalLevels,
        items,
        fees,
        savePayment,
        toast,
        loadData,
    ])

    const onPaymentMode = (v: string) => {
        setPaymentPercentage(v === 'FULL' ? 100 : (p) => (p >= 100 || p === 0 ? 50 : p))
        touch()
    }

    const onPartialPct = (raw: string) => {
        setPaymentPercentage(Math.min(100, Math.max(0, Number(raw))))
        touch()
    }

    const mapPaperFiles = (files: FileList | null) => {
        if (!files?.length) return
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
        setPapers((p) => [...p, ...mapped])
        touch()
    }

    return (
        <div className="pb-28">
            <HeaderPageLayout title="Cập nhật đề nghị thanh toán" buttonSubmit={null} />
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stepItems.map((s) => (
                    <SectionStep key={s.label} icon={s.icon} label={s.label} helper={s.helper} state={s.state as 'done' | 'current' | 'pending'} />
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm uppercase">Thông tin đề nghị</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Mã đề nghị</Label>
                                <Input className="h-8 text-xs" value={paymentData?.requestNumber ?? ''} disabled />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Nhà cung cấp</Label>
                                <Input className="h-8 text-xs" value={purpose} onChange={(e) => { setPurpose(e.target.value); touch() }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Tiền tệ</Label>
                                <Select value={currency} onValueChange={(v) => { setCurrency(v); touch() }}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                                    onChange={(e) => { setExchangeRate(Number(e.target.value)); touch() }}
                                    disabled={currency === 'VND'}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Hạn thanh toán</Label>
                                <Input type="date" className="h-8 text-xs" value={requestDate} onChange={(e) => { setRequestDate(e.target.value); touch() }} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Số cấp duyệt</Label>
                                <Select value={String(approvalLevels)} onValueChange={(v) => { setApprovalLevels(Number(v)); touch() }}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3].map((n) => (
                                            <SelectItem key={n} value={String(n)} className="text-xs">{n} cấp</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">
                                Hình thức thanh toán <span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup value={paymentMode} onValueChange={onPaymentMode} disabled={!hasLoadedLines} className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="FULL" id="pay-full" />
                                    <Label htmlFor="pay-full" className="cursor-pointer text-xs font-normal">Thanh toán toàn bộ (100%)</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="PARTIAL" id="pay-partial" />
                                    <Label htmlFor="pay-partial" className="cursor-pointer text-xs font-normal">Thanh toán một phần</Label>
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
                                        onChange={(e) => onPartialPct(e.target.value)}
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
                        {BANK_FIELDS.map(({ field, label }) => (
                            <div key={field} className="space-y-1">
                                <Label className="text-xs">{label}</Label>
                                <Input
                                    className="h-8 text-xs"
                                    value={bankInfo[field]}
                                    onChange={(e) => { setBankInfo((b) => ({ ...b, [field]: e.target.value })); touch() }}
                                    disabled={!hasLoadedLines}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4">
                <PaymentLinesViewSection
                    items={items}
                    filteredItems={items}
                    papers={papers}
                    fees={fees}
                    hasLoadedLines={hasLoadedLines}
                    filteredQuantity={filteredQuantity}
                    filteredRequestedAmountRaw={amount}
                    filteredRequestedAmount={requestedAmount}
                    effectivePercentage={paymentPercentage}
                    paymentMode={paymentMode}
                    currency={currency}
                    feeTypeOptions={PAYMENT_REQUEST_FEE_TYPE_OPTIONS}
                    onUploadPapers={mapPaperFiles}
                    onRemovePaper={(i) => { setPapers((p) => p.filter((_, j) => j !== i)); touch() }}
                    onAddFee={() => { setFees((f) => [...f, emptyFee()]); touch() }}
                    onRemoveFee={(i) => { setFees((f) => f.filter((_, j) => j !== i)); touch() }}
                    onUpdateFee={(i, field, value) => {
                        setFees((f) => f.map((row, j) => (j === i ? { ...row, [field]: value } : row)))
                        touch()
                    }}
                    numberWithCommas={numberWithCommas}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <FooterStat label="Đơn mua hàng">
                            <span className="font-medium text-foreground">{hasLoadedLines ? `${items.length} dòng PO` : '—'}</span>
                        </FooterStat>
                        <FooterStat label="Hình thức">
                            <span className="font-medium text-foreground">{paymentMode === 'FULL' ? 'Toàn bộ' : `${paymentPercentage}%`}</span>
                        </FooterStat>
                        <FooterStat label="Tiền hàng (tổng dòng)">
                            <span className="font-medium text-foreground tabular-nums">{numberWithCommas(amount)} {currency}</span>
                        </FooterStat>
                        <FooterStat label={`Đề nghị thanh toán (${paymentPercentage}%)`}>
                            <span className="font-semibold text-foreground tabular-nums">{numberWithCommas(requestedAmount)} {currency}</span>
                        </FooterStat>
                        {feeAmount > 0 && (
                            <FooterStat label="Tổng phí">
                                <span className="font-medium text-foreground tabular-nums">{numberWithCommas(feeAmount)} {currency}</span>
                            </FooterStat>
                        )}
                        <FooterStat label="Tổng cộng (VND)">
                            <span className="font-bold text-primary">{formatCurrencyVN(totalAmountVnd)}</span>
                        </FooterStat>
                        <FooterStat label="Ngày tạo">
                            <span className="font-medium text-foreground">
                                {paymentData?.requestDate ? moment(paymentData.requestDate).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}
                            </span>
                        </FooterStat>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => void loadData()} disabled={isLoading || isSaving}>
                            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => history.back()} disabled={isSaving}>
                            Quay lại
                        </Button>
                        <Button type="button" size="sm" disabled={!isDirty || isSaving || !purpose.trim()} onClick={() => void handleSubmit()}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu cập nhật
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
