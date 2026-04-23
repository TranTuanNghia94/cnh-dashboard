import HeaderPageLayout from '@/components/layout/HeaderPage'
import { SectionStep } from '@/components/order/order-ui'
import type { PaymentPaperSource } from '@/components/payment/payment-paper-upload-section'
import PaymentApprovalHistorySection from '@/components/payment/payment-approval-history-section'
import PaymentLinesViewSection from '@/components/payment/update/payment-lines-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateOrUpdatePaymentRequest, useGetPaymentRequestById, useGetPaymentRequestFiles, useUploadPaymentRequestFile } from '@/hooks/use-payment'
import { useToast } from '@/hooks/use-toast'
import {
    CURRENCY_OPTIONS,
    LIST_ROLES,
    PAYMENT_REQUEST_FEE_TYPE_OPTIONS,
    PAYMENT_REQUEST_FILE_CATEGORY,
    PAYMENT_REQUEST_STATUS_APPROVED,
    PAYMENT_REQUEST_STATUS_CANCELLED,
    PAYMENT_REQUEST_STATUS_DRAFT,
    PAYMENT_REQUEST_STATUS_PARTIALLY_PAID,
    PAYMENT_REQUEST_STATUS_PAID,
    PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL,
    PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL,
    PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL,
    PAYMENT_REQUEST_STATUS_REJECTED,
    PAYMENT_REQUEST_STATUS_SUBMITTED,
    PaymentMode,
    QUERIES,
} from '@/lib/constants'
import { getCookie, getRolesFromCookie, SUB } from '@/lib/cookie'
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
    IUploadPaymentRequestFileRequest,
} from '@/types/payment'
import { IPurchaseOrderLineResponse } from '@/types/purchase'
import { useIsMutating } from '@tanstack/react-query'
import { createLazyFileRoute, useBlocker, useParams, useRouter } from '@tanstack/react-router'
import ConfirmSubmitToAccountant from '@/components/modal/payment/confirm-submit-to-accountant'
import { ApprovePaymentRequestDialog } from '@/components/modal/payment/approve-payment-request-dialog'
import { RejectPaymentRequestDialog } from '@/components/modal/payment/reject-payment-request-dialog'
import { BanknoteIcon, Ban, CheckCircle2, ClipboardList, Loader2, RefreshCcw, Save, Send, UserCheck } from 'lucide-react'
import moment from 'moment'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'




type PaymentItemView = IPaymentRequestItemRequest & {
    _id: string
    _line: IPurchaseOrderLineResponse
}

const PAYMENT_STATUSES_BANK_NOTE_ONLY = new Set([
    PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL,
    PAYMENT_REQUEST_STATUS_APPROVED,
    PAYMENT_REQUEST_STATUS_PARTIALLY_PAID,
    PAYMENT_REQUEST_STATUS_PAID,
])

const TERMINAL_PAYMENT_STATUSES = new Set([PAYMENT_REQUEST_STATUS_REJECTED, PAYMENT_REQUEST_STATUS_CANCELLED])

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
    { field: 'branch', label: 'Chi nhánh' },
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
    const { mutateAsync: uploadPaymentRequestFile } = useUploadPaymentRequestFile()
    const approveMutatingCount = useIsMutating({ mutationKey: [QUERIES.APPROVE_PAYMENT_REQUEST] })
    const rejectMutatingCount = useIsMutating({ mutationKey: [QUERIES.REJECT_PAYMENT_REQUEST] })
    const isReviewMutating = approveMutatingCount > 0 || rejectMutatingCount > 0
    const { mutateAsync: getPaymentRequestFilesById } = useGetPaymentRequestFiles()

    const [paymentData, setPaymentData] = useState<IPaymentRequestInfo>()
    const [currency, setCurrency] = useState('VND')
    const [exchangeRate, setExchangeRate] = useState(1)
    const [purpose, setPurpose] = useState('')
    const [approvalLevels, setApprovalLevels] = useState(1)
    const [bankInfo, setBankInfo] = useState<IPaymentBankInfoObject>(emptyBankInfo())
    const [fees, setFees] = useState<IPaymentRequestFeeRequest[]>([])
    const [papers, setPapers] = useState<IUploadPaymentRequestFileRequest[]>([])
    const [bankNotePending, setBankNotePending] = useState<IUploadPaymentRequestFileRequest[]>([])
    const [bankNoteExisting, setBankNoteExisting] = useState<PaymentPaperSource[]>([])
    const [items, setItems] = useState<PaymentItemView[]>([])
    const [requestDate, setRequestDate] = useState('')
    const [isDirty, setIsDirty] = useState(false)
    const [paymentPercentage, setPaymentPercentage] = useState(100)
    const [paperFiles, setPaperFiles] = useState<IPaymentFileObject[]>([])
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [bankNoteFiles, setBankNoteFiles] = useState<IPaymentFileObject[]>([])

    const touch = useCallback(() => setIsDirty(true), [])

    // Không dùng `isDirty && !isSaving`: khi đang lưu `isSaving` = true làm điều kiện false → blocker tắt, router có thể chuyển trang (vd. /payment) giữa lúc gọi API.
    useBlocker({
        blockerFn: () => window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?'),
        condition: isDirty || isSaving || isReviewMutating,
    })

    const loadData = useCallback(async () => {
        if (!paymentId) return
        const data = (await getById(paymentId))?.data as IPaymentRequestInfo | undefined
        if (!data) return

        const files = await getPaymentRequestFilesById(paymentId)
        setPaperFiles(files.data?.filter((f) => f.attachmentType === 'PAPER') ?? [])
        setBankNoteFiles(files.data?.filter((f) => f.attachmentType === 'BANK_NOTE') ?? [])
        setPaymentData(data)
        setCurrency(data.currency ?? 'VND')
        setExchangeRate(Number(data.exchangeRate ?? 1))
        setPurpose(data.purpose ?? '')
        setApprovalLevels(Number(data.approvalLevels ?? 1))
        setBankInfo(data.bankInfo ?? emptyBankInfo())
        const bn = data.bankNote
        setBankNoteExisting(
            (bn?.attachments ?? []).map((a) => ({
                kind: 'meta' as const,
                fileName: a.fileName,
                fileUrl: a.fileUrl,
                viewUrl: a.viewUrl,
                size: Number(a.size ?? 0),
                contentType: a.contentType ?? '',
            })),
        )
        setBankNotePending([])
        setFees(mapFees(data.fees))
        setItems(mapItems(data.items))
        setRequestDate(data.requestDate ? moment(data.requestDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'))
        setPaymentPercentage(data.paidPercentage ?? 100)
        setIsDirty(false)
    }, [getById, getPaymentRequestFilesById, paymentId])

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

    const access = useMemo(() => {
        if (!paymentData) {
            return {
                sectionLock: 'readonly' as const,
                formFieldsEditable: false,
                canShowSubmitToAccountant: false,
                canApproveLevel1: false,
                canApproveLevel2: false,
                bankNotesOnly: false,
                ownerNonDraftReadOnlyHint: false,
                canUploadBankNotes: false,
            }
        }
        const status = paymentData.status
        const sub = getCookie(SUB) ?? ''
        const roles = getRolesFromCookie()
        const isAdmin = roles.includes(LIST_ROLES.ADMIN.code)
        const isAccountant = roles.includes(LIST_ROLES.ACCOUNTANT.code)
        const isHeadAccountant = roles.includes(LIST_ROLES.ACCOUNTANT_MANAGER.code)
        const isOwner = Boolean(sub && (paymentData.requestorId === sub || paymentData.createdBy === sub))
        const isDraft = status === PAYMENT_REQUEST_STATUS_DRAFT
        const terminal = TERMINAL_PAYMENT_STATUSES.has(status)
        const bankNotesOnly = PAYMENT_STATUSES_BANK_NOTE_ONLY.has(status) && !terminal
        const canEditAllFields = isDraft && (isOwner || isAdmin)
        const canApproveLevel1 =
            !terminal &&
            (status === PAYMENT_REQUEST_STATUS_SUBMITTED || status === PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL) &&
            isAccountant
        const canApproveLevel2 = !terminal && status === PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL && isHeadAccountant
        const canUploadBankNotes = isAccountant || isHeadAccountant
        const canInteractBankNotesWhenRestricted = bankNotesOnly && canUploadBankNotes
        const sectionLock: 'full' | 'readonly' | 'banknotes-only' = canEditAllFields
            ? 'full'
            : bankNotesOnly && canInteractBankNotesWhenRestricted
                ? 'banknotes-only'
                : 'readonly'

        return {
            sectionLock,
            formFieldsEditable: canEditAllFields,
            canShowSubmitToAccountant: isDraft && (isOwner || isAdmin),
            canApproveLevel1,
            canApproveLevel2,
            bankNotesOnly,
            ownerNonDraftReadOnlyHint: !isDraft && isOwner && !isAdmin && !bankNotesOnly,
            canUploadBankNotes,
        }
    }, [paymentData])

    const stepItems = useMemo(
        () => [
            { icon: ClipboardList, label: 'Đơn mua hàng', helper: hasLoadedLines ? `${items.length} dòng PO` : 'Không có dòng thanh toán', state: hasLoadedLines ? 'done' : 'current' },
            { icon: BanknoteIcon, label: 'Thông tin thanh toán', helper: purpose || 'Điền mục đích, tiền tệ, tỷ giá', state: purpose.trim() ? 'done' : hasLoadedLines ? 'current' : 'pending' },
            { icon: CheckCircle2, label: 'Phí & chứng từ', helper: `${fees.length} phí • ${papers.length + bankNotePending.length} file`, state: hasLoadedLines ? 'current' : 'pending' },
            { icon: Save, label: 'Xác nhận & lưu', helper: isDirty ? 'Có thay đổi chưa lưu' : 'Không có thay đổi mới', state: isDirty ? 'current' : 'pending' },
        ] as const,
        [hasLoadedLines, items.length, purpose, fees.length, papers.length, bankNotePending.length, isDirty],
    )

    const handleSubmit = useCallback(async () => {
        if (!paymentData?.id) return

        if (access.sectionLock === 'banknotes-only') {
            if (bankNotePending.length === 0) return
            try {
                for (const f of bankNotePending) {
                    await uploadPaymentRequestFile(f)
                }
                toast({ title: 'Thao tác thành công', description: 'Đã tải lên bank note.', variant: 'success' })
                await loadData()
            } catch {
                // Lỗi đã toast trong hook mutation
            }
            return
        }

        if (!purpose.trim()) return
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
            papers: [],
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
            if (papers.length > 0) {
                for (const paper of papers) {
                    await uploadPaymentRequestFile(paper)
                }
            }
            if (bankNotePending.length > 0) {
                for (const f of bankNotePending) {
                    await uploadPaymentRequestFile(f)
                }
            }
            await savePayment(payload)

            toast({ title: 'Thao tác thành công', description: 'Đã cập nhật đề nghị thanh toán.', variant: 'success' })
            await loadData()
        } catch {
            // Lỗi đã toast trong hook mutation
        }
    }, [
        paymentData,
        access,
        purpose,
        currency,
        exchangeRate,
        requestDate,
        paymentPercentage,
        papers,
        bankNotePending,
        uploadPaymentRequestFile,
        bankInfo,
        approvalLevels,
        items,
        fees,
        savePayment,
        toast,
        loadData,
    ])

    const approverRoleDescription = useMemo(() => {
        if (access.canApproveLevel1) return 'Bạn đang duyệt với vai trò kế toán (cấp 1). '
        if (access.canApproveLevel2) return 'Bạn đang duyệt với vai trò kế toán trưởng (cấp 2). '
        return ''
    }, [access.canApproveLevel1, access.canApproveLevel2])

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
        const mapped: IUploadPaymentRequestFileRequest[] = Array.from(files).map((file) => ({
            file,
            category: PAYMENT_REQUEST_FILE_CATEGORY.PAPERS,
            paymentRequestId: paymentData?.id || '',
            attachmentType: 'PAPER',
        }))
        setPapers((p) => [...p, ...mapped])
        touch()
    }

    const mapBankNoteFiles = (files: FileList | null) => {
        if (!files?.length) return
        const mapped: IUploadPaymentRequestFileRequest[] = Array.from(files).map((file) => ({
            file,
            category: PAYMENT_REQUEST_FILE_CATEGORY.BANK_NOTE,
            paymentRequestId: paymentData?.id || '',
            attachmentType: 'BANK_NOTE',
        }))
        setBankNotePending((p) => [...p, ...mapped])
        touch()
    }

    const formFieldsEditable = access.formFieldsEditable
    const canSave =
        (formFieldsEditable && isDirty) || (access.sectionLock === 'banknotes-only' && bankNotePending.length > 0)

    return (
        <div className="pb-28">
            <HeaderPageLayout title="Cập nhật đề nghị thanh toán" buttonSubmit={null} />
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stepItems.map((s) => (
                    <SectionStep key={s.label} icon={s.icon} label={s.label} helper={s.helper} state={s.state as 'done' | 'current' | 'pending'} />
                ))}
            </div>

            {access.ownerNonDraftReadOnlyHint && (
                <p className="mt-3 text-sm text-muted-foreground">
                    Đề nghị đã gửi: bạn chỉ xem. Chỉ kế toán / kế toán trưởng mới duyệt trên hệ thống.
                </p>
            )}
            {access.sectionLock === 'banknotes-only' && (
                <p className="mt-2 text-sm text-muted-foreground">
                    Giai đoạn này chỉ kế toán / kế toán trưởng tải bank note (chứng từ thanh toán). Các nội dung khác đã khóa.
                </p>
            )}
            {access.bankNotesOnly && access.sectionLock !== 'banknotes-only' && (
                <p className="mt-2 text-sm text-muted-foreground">
                    Đề nghị đang chờ kế toán / kế toán trưởng tải bank note lên hệ thống.
                </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-6">
                <Card className="col-span-2">
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
                                <Input
                                    className="h-8 text-xs"
                                    value={purpose}
                                    disabled={!formFieldsEditable}
                                    onChange={(e) => { setPurpose(e.target.value); touch() }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Tiền tệ</Label>
                                <Select value={currency} onValueChange={(v) => { setCurrency(v); touch() }} disabled={!formFieldsEditable}>
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
                                    disabled={currency === 'VND' || !formFieldsEditable}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Hạn thanh toán</Label>
                                <Input
                                    type="date"
                                    className="h-8 text-xs"
                                    value={requestDate}
                                    disabled={!formFieldsEditable}
                                    onChange={(e) => { setRequestDate(e.target.value); touch() }}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Số cấp duyệt</Label>
                                <Select value={String(approvalLevels)} onValueChange={(v) => { setApprovalLevels(Number(v)); touch() }} disabled={!formFieldsEditable}>
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
                            <RadioGroup value={paymentMode} onValueChange={onPaymentMode} disabled={!hasLoadedLines || !formFieldsEditable} className="flex gap-4">
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
                                        disabled={!hasLoadedLines || !formFieldsEditable}
                                    />
                                    <span className="text-xs text-muted-foreground">% tổng giá trị đơn hàng</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className={!hasLoadedLines ? 'opacity-60 col-span-2' : 'col-span-2'}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm uppercase">Thông tin ngân hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-1">
                        {BANK_FIELDS.map(({ field, label }) => (
                            <div key={field} className="space-y-1">
                                <Label className="text-xs">{label}</Label>
                                <Input
                                    className="h-8 text-xs"
                                    value={bankInfo[field]}
                                    onChange={(e) => { setBankInfo((b) => ({ ...b, [field]: e.target.value })); touch() }}
                                    disabled={!hasLoadedLines || !formFieldsEditable}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {paymentData && (
                    <div className="col-span-2">
                        <Card className="mb-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm uppercase">Số chứng từ</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {paymentData.notes.split('\n').map((line, index) => (
                                        <p key={index} className="text-xs">{line}</p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <PaymentApprovalHistorySection approvals={paymentData.approvals} approvalLevels={paymentData.approvalLevels} />
                    </div>
                )}
            </div>

            <div className="mt-4">
                <PaymentLinesViewSection
                    items={items}
                    filteredItems={items}
                    papers={papers}
                    fees={fees}
                    paperFiles={paperFiles}
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
                    onUploadBankNotes={mapBankNoteFiles}
                    onRemoveBankNotePending={(i) => { setBankNotePending((p) => p.filter((_, j) => j !== i)); touch() }}
                    bankNotePending={bankNotePending}
                    bankNoteExistingSources={bankNoteFiles as unknown as PaymentPaperSource[]}
                    sectionLock={access.sectionLock}
                    allowBankNoteUpload={access.canUploadBankNotes}
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
                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={() => void loadData()} disabled={isLoading || isSaving || isReviewMutating}>
                            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => history.back()} disabled={isSaving || isReviewMutating}>
                            Quay lại
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={
                                !canSave ||
                                isSaving ||
                                isReviewMutating ||
                                (access.sectionLock !== 'banknotes-only' && !purpose.trim())
                            }
                            onClick={() => void handleSubmit()}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {access.sectionLock === 'banknotes-only' ? 'Tải bank note' : 'Lưu cập nhật'}
                                </>
                            )}
                        </Button>
                        {(access.canApproveLevel1 || access.canApproveLevel2) && (
                            <>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                                    disabled={isSaving || isReviewMutating || !paymentData?.id}
                                    onClick={() => setRejectOpen(true)}
                                >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Từ chối
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    className="bg-sky-600 hover:bg-sky-700"
                                    disabled={isSaving || isReviewMutating || !paymentData?.id}
                                    onClick={() => setApproveOpen(true)}
                                >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Duyệt
                                </Button>
                            </>
                        )}
                        {access.canShowSubmitToAccountant && (
                            <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={isDirty || isSaving || isReviewMutating || !paymentData?.id}
                                onClick={() => setShowSubmitModal(true)}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Gửi kế toán
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {paymentData && (
                <ConfirmSubmitToAccountant
                    open={showSubmitModal}
                    onOpenChange={setShowSubmitModal}
                    paymentData={paymentData}
                    onSuccess={() => void loadData()}
                />
            )}

            {(access.canApproveLevel1 || access.canApproveLevel2) && paymentData?.id && (
                <>
                    <ApprovePaymentRequestDialog
                        open={approveOpen}
                        onOpenChange={setApproveOpen}
                        paymentRequestId={paymentData.id}
                        approvalLevel={Number(paymentData.currentApprovalLevel ?? 1) + 1}
                        roleDescription={approverRoleDescription}
                        onSuccess={() => void loadData()}
                    />
                    <RejectPaymentRequestDialog
                        open={rejectOpen}
                        onOpenChange={setRejectOpen}
                        paymentRequestId={paymentData.id}
                        approvalLevel={Number(paymentData.currentApprovalLevel ?? 1) + 1}
                        roleDescription={approverRoleDescription}
                        onSuccess={() => void loadData()}
                    />
                </>
            )}
        </div>
    )
}
