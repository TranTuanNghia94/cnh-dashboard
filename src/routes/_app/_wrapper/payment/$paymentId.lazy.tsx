import HeaderPageLayout from '@/components/layout/HeaderPage'
import { SectionStep } from '@/components/order/order-ui'
import PaymentLinesSection from '@/components/payment/new/payment-lines-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateOrUpdatePaymentRequest, useGetPaymentRequestById } from '@/hooks/use-payment'
import { useToast } from '@/hooks/use-toast'
import { getCookie, SUB } from '@/lib/cookie'
import { formatCurrencyVN, numberWithCommas } from '@/lib/other'
import { ICreateOrUpdatePaymentRequest, IPaymentBankInfoObject, IPaymentFileObject, IPaymentRequestFeeRequest, IPaymentRequestInfo, IPaymentRequestItemRequest } from '@/types/payment'
import { IPurchaseOrderLineResponse } from '@/types/purchase'
import { createLazyFileRoute, useBlocker, useParams, useRouter } from '@tanstack/react-router'
import { BanknoteIcon, CheckCircle2, ClipboardList, Loader2, RefreshCcw, Save } from 'lucide-react'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'

const CURRENCY_OPTIONS = ['VND', 'USD', 'EUR', 'CNY', 'JPY']
const FEE_TYPE_OPTIONS = [
    { value: 'SHIPPING', label: 'Vận chuyển' },
    { value: 'CUSTOMS', label: 'Hải quan' },
    { value: 'INSURANCE', label: 'Bảo hiểm' },
    { value: 'HANDLING', label: 'Bốc xếp' },
    { value: 'OTHER', label: 'Khác' },
]

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

const parseSelectedDocumentTypes = (selectedDocuments?: string): string[] => {
    const raw = String(selectedDocuments ?? '').trim()
    if (!raw) return []
    return raw
        .split(/[\n,|]/g)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
            const token = item.startsWith('[DOCS]') ? item.replace('[DOCS]', '').trim() : item
            return token.includes(':') ? token.split(':')[0]?.trim() ?? '' : token
        })
        .filter(Boolean)
}

type PaymentItemView = IPaymentRequestItemRequest & {
    _id: string
    _line: IPurchaseOrderLineResponse
    selectedDocumentsRaw?: string
}

export const Route = createLazyFileRoute('/_app/_wrapper/payment/$paymentId')({
    component: PaymentDetailPage,
})

function PaymentDetailPage() {
    const { paymentId } = useParams({ strict: false })
    const { history } = useRouter()
    const { toast } = useToast()
    const { mutateAsync: getById, isPending: isLoading } = useGetPaymentRequestById()
    const { mutateAsync: createOrUpdatePaymentRequest, isPending: isSaving, isSuccess } = useCreateOrUpdatePaymentRequest()

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

    useBlocker({
        blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
        condition: isDirty && !isSaving,
    })

    const loadData = useCallback(async () => {
        if (!paymentId) return
        const res = await getById(paymentId)
        const data = res?.data as IPaymentRequestInfo | undefined
        if (!data) return

        setPaymentData(data)
        setCurrency(data.currency ?? 'VND')
        setExchangeRate(Number(data.exchangeRate ?? 1))
        setPurpose(data.purpose ?? '')
        setApprovalLevels(Number(data.approvalLevels ?? 1))
        setBankInfo(data.bankInfo ?? emptyBankInfo())
        setPapers(data.papers ?? [])
        setFees((data.fees ?? []).map((fee) => ({
            feeName: fee.feeName ?? '',
            feeType: fee.feeType ?? 'OTHER',
            amount: Number(fee.amount ?? 0),
            note: fee.note ?? '',
        })))
        setItems((data.items ?? []).map((line) => ({
            _id: crypto.randomUUID(),
            purchaseOrderLineId: line.purchaseOrderLineId,
            requestedAmount: Number(line.requestedAmount ?? 0),
            note: line.note ?? '',
            selectedDocumentTypes: parseSelectedDocumentTypes(line.selectedDocuments),
            selectedDocumentsRaw: line.selectedDocuments ?? '',
            _line: {
                quantity: 1,
                unitPrice: Number(line.requestedAmount ?? 0),
                totalPrice: Number(line.requestedAmount ?? 0),
            } as IPurchaseOrderLineResponse,
        })))
        setRequestDate(data.requestDate ? moment(data.requestDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'))
        setIsDirty(false)
    }, [getById, paymentId])

    useEffect(() => {
        void loadData()
    }, [loadData])

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: 'Thao tác thành công',
                description: 'Đã cập nhật đề nghị thanh toán.',
                variant: 'success',
            })
            setIsDirty(false)
            history.back()
        }
    }, [history, isSuccess, toast])

    const totalRequestedAmount = useMemo(
        () => items.reduce((acc, item) => acc + Number(item.requestedAmount ?? 0), 0),
        [items],
    )
    const totalFeesAmount = useMemo(
        () => fees.reduce((acc, fee) => acc + Number(fee.amount ?? 0), 0),
        [fees],
    )
    const filteredQuantity = useMemo(
        () => items.reduce((acc, item) => acc + Number(item._line.quantity ?? 0), 0),
        [items],
    )
    const grandTotal = totalRequestedAmount + totalFeesAmount
    const grandTotalVnd = currency === 'VND' ? grandTotal : grandTotal * exchangeRate
    const hasLoadedLines = items.length > 0

    const stepItems = useMemo(
        () => [
            {
                icon: ClipboardList,
                label: 'Đơn mua hàng',
                helper: items.length > 0 ? `${items.length} dòng PO` : 'Không có dòng thanh toán',
                state: (items.length > 0 ? 'done' : 'current') as 'done' | 'current' | 'pending',
            },
            {
                icon: BanknoteIcon,
                label: 'Thông tin thanh toán',
                helper: purpose ? purpose : 'Điền mục đích, tiền tệ, tỷ giá',
                state: (purpose.trim() ? 'done' : items.length > 0 ? 'current' : 'pending') as 'done' | 'current' | 'pending',
            },
            {
                icon: CheckCircle2,
                label: 'Phí & chứng từ',
                helper: `${fees.length} phí • ${papers.length} chứng từ`,
                state: (items.length > 0 ? 'current' : 'pending') as 'done' | 'current' | 'pending',
            },
            {
                icon: Save,
                label: 'Xác nhận & lưu',
                helper: isDirty ? 'Có thay đổi chưa lưu' : 'Không có thay đổi mới',
                state: (isDirty ? 'current' : 'pending') as 'done' | 'current' | 'pending',
            },
        ],
        [items.length, purpose, fees.length, papers.length, isDirty],
    )

    const handleUpdateBankInfo = useCallback((field: keyof IPaymentBankInfoObject, value: string) => {
        setBankInfo((prev) => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }, [])

    const handleAddFee = useCallback(() => {
        setFees((prev) => [...prev, emptyFee()])
        setIsDirty(true)
    }, [])

    const handleRemoveFee = useCallback((index: number) => {
        setFees((prev) => prev.filter((_, i) => i !== index))
        setIsDirty(true)
    }, [])

    const handleUpdateFee = useCallback((index: number, field: keyof IPaymentRequestFeeRequest, value: string | number) => {
        setFees((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)))
        setIsDirty(true)
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
        setIsDirty(true)
    }, [])

    const handleRemovePaper = useCallback((index: number) => {
        setPapers((prev) => prev.filter((_, i) => i !== index))
        setIsDirty(true)
    }, [])

    const handleSubmit = useCallback(async () => {
        if (!paymentData?.id || !purpose.trim()) return
        const payload: ICreateOrUpdatePaymentRequest = {
            id: paymentData.id,
            requestorId: paymentData.requestorId || getCookie(SUB) || '',
            currency,
            exchangeRate: Number(exchangeRate ?? 1),
            requestDate: `${requestDate || moment().format('YYYY-MM-DD')}T00:00:00.000Z`,
            purpose: purpose.trim(),
            notes: paymentData.notes ?? '',
            papers,
            bankInfo,
            approvalLevels: Number(approvalLevels ?? 1),
            items: items.map((item) => ({
                purchaseOrderLineId: item.purchaseOrderLineId,
                requestedAmount: item.requestedAmount,
                note: item.note,
                selectedDocumentTypes: item.selectedDocumentTypes,
            })),
            fees,
        }
        await createOrUpdatePaymentRequest(payload)
    }, [paymentData, purpose, currency, exchangeRate, requestDate, papers, bankInfo, approvalLevels, items, fees, createOrUpdatePaymentRequest])

    return (
        <div className="pb-28">
            <HeaderPageLayout title="Cập nhật đề nghị thanh toán" buttonSubmit={<></>} />
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stepItems.map((step) => (
                    <SectionStep key={step.label} icon={step.icon} label={step.label} helper={step.helper} state={step.state} />
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
                                <Input className="h-8 text-xs" value={purpose} onChange={(e) => { setPurpose(e.target.value); setIsDirty(true) }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Tiền tệ</Label>
                                <Select value={currency} onValueChange={(v) => { setCurrency(v); setIsDirty(true) }}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CURRENCY_OPTIONS.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
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
                                    onChange={(e) => { setExchangeRate(Number(e.target.value)); setIsDirty(true) }}
                                    disabled={currency === 'VND'}
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Hạn thanh toán</Label>
                                <Input type="date" className="h-8 text-xs" value={requestDate} onChange={(e) => { setRequestDate(e.target.value); setIsDirty(true) }} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Số cấp duyệt</Label>
                                <Select value={String(approvalLevels)} onValueChange={(v) => { setApprovalLevels(Number(v)); setIsDirty(true) }}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3].map((n) => <SelectItem key={n} value={String(n)} className="text-xs">{n} cấp</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
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
                                { field: 'swiftCode', label: 'SWIFT / BIC' },
                                { field: 'branch', label: 'Chi nhánh' },
                                { field: 'beneficiaryAddress', label: 'Địa chỉ thụ hưởng' },
                            ] as { field: keyof IPaymentBankInfoObject; label: string }[]
                        ).map(({ field, label }) => (
                            <div key={field} className="space-y-1">
                                <Label className="text-xs">{label}</Label>
                                <Input className="h-8 text-xs" value={bankInfo[field]} onChange={(e) => handleUpdateBankInfo(field, e.target.value)} disabled={!hasLoadedLines} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4">
                <PaymentLinesSection
                    items={items}
                    filteredItems={items}
                    papers={papers}
                    fees={fees}
                    hasLoadedLines={hasLoadedLines}
                    filteredQuantity={filteredQuantity}
                    filteredRequestedAmountRaw={totalRequestedAmount}
                    filteredRequestedAmount={totalRequestedAmount}
                    effectivePercentage={100}
                    paymentMode="FULL"
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

            <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex flex-col">
                            <span className="text-[11px] uppercase text-muted-foreground">Mã đề nghị</span>
                            <span className="font-medium text-foreground">{paymentData?.requestNumber ?? '—'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] uppercase text-muted-foreground">Tiền hàng</span>
                            <span className="font-medium tabular-nums">{numberWithCommas(totalRequestedAmount)} {currency}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] uppercase text-muted-foreground">Phí phát sinh</span>
                            <span className="font-medium tabular-nums">{numberWithCommas(totalFeesAmount)} {currency}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] uppercase text-muted-foreground">Tổng cộng (VND)</span>
                            <span className="font-bold text-primary">{formatCurrencyVN(grandTotalVnd)}</span>
                        </div>
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