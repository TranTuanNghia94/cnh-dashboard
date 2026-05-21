import HeaderPageLayout from '@/components/layout/HeaderPage'
import type { PaymentPaperSource } from '@/components/payment/payment-paper-upload-section'
import PaymentApprovalHistorySection from '@/components/payment/payment-approval-history-section'
import PaymentLinesViewSection from '@/components/payment/update/payment-lines-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCreateOrUpdatePaymentRequest, useGetPaymentRequestById, useGetPaymentRequestFiles, useUploadPaymentRequestFile } from '@/hooks/use-payment'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
    CURRENCY_OPTIONS,
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
    PAYMENT_REQUEST_STATUS_STYLES,
    PAYMENT_REQUEST_STATUS_SUBMITTED,
    PaymentMode,
    QUERIES,
} from '@/lib/constants'
import { getCookie, SUB } from '@/lib/cookie'
import { downloadPaymentDeNghiThanhToanPdf } from '@/lib/payment-dnt-pdf'
import { formatCurrencyVN, numberWithCommas, purchaseOrderLineExtendedAmount } from '@/lib/other'
import { hasPermission, PERMISSION_CODES } from '@/lib/permissions'
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
import { BanknoteIcon, Ban, CheckCircle2, Eye, FileDown, FileText, Info, Lock, Loader2, RefreshCcw, Save, Send, UserCheck } from 'lucide-react'
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

const hasAnyBankInfo = (bankInfo: IPaymentBankInfoObject): boolean =>
    Object.values(bankInfo).some((val) => String(val ?? '').trim().length > 0)

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
        <div className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="min-w-0 truncate">{children}</span>
        </div>
    )
}

function DisplayField({
    label,
    value,
    hint,
    required,
    mono,
    className,
}: {
    label: string
    value: ReactNode
    hint?: string
    required?: boolean
    mono?: boolean
    className?: string
}) {
    const isEmpty = value == null || value === '' || (typeof value === 'string' && !value.trim())
    return (
        <div className={cn('space-y-0.5', className)}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </p>
            <p
                className={cn(
                    'text-sm leading-5',
                    mono && 'font-mono text-xs',
                    isEmpty ? 'italic text-muted-foreground' : 'font-medium text-foreground',
                )}
            >
                {isEmpty ? '—' : value}
            </p>
            {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
    )
}

const DEFAULT_STATUS_STYLE = { label: 'Không xác định', style: 'text-gray-500 bg-gray-100' }

type RoleHint = {
    tone: 'info' | 'warn' | 'success' | 'muted'
    title: string
    description: string
}

function RoleHintBanner({ hint }: { hint: RoleHint | null }) {
    if (!hint) return null
    const toneClass = {
        info: 'border-sky-200 bg-sky-50 text-sky-900',
        warn: 'border-amber-200 bg-amber-50 text-amber-900',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        muted: 'border-border bg-muted/40 text-muted-foreground',
    }[hint.tone]
    const Icon = hint.tone === 'warn' ? Info : hint.tone === 'success' ? CheckCircle2 : hint.tone === 'info' ? BanknoteIcon : Lock
    return (
        <div className={cn('mt-3 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', toneClass)}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex min-w-0 flex-col gap-0.5">
                <p className="font-semibold">{hint.title}</p>
                <p className="text-xs leading-relaxed opacity-90">{hint.description}</p>
            </div>
        </div>
    )
}

/** Parse notes string into readable chips, filtering internal markers like [PREV_PAID:...]. */
function parseNoteTokens(notes: string | undefined): string[] {
    return String(notes ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((token) => !token.startsWith('[PREV_PAID') && !token.startsWith('[DOCS]'))
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
    const [items, setItems] = useState<PaymentItemView[]>([])
    const [requestDate, setRequestDate] = useState('')
    const [isDirty, setIsDirty] = useState(false)
    const [paymentPercentage, setPaymentPercentage] = useState(100)
    const [paperFiles, setPaperFiles] = useState<IPaymentFileObject[]>([])
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [bankNoteFiles, setBankNoteFiles] = useState<IPaymentFileObject[]>([])
    const [isPdfExporting, setIsPdfExporting] = useState(false)

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
                canApproveFinal: false,
                bankNotesOnly: false,
                ownerNonDraftReadOnlyHint: false,
                canUploadBankNotes: false,
            }
        }
        const status = paymentData.status
        const sub = getCookie(SUB) ?? ''
        const canCreatePayment = hasPermission(PERMISSION_CODES.PAYMENT_CREATE)
        const canApprovePaymentLevel1 = hasPermission(PERMISSION_CODES.PAYMENT_APPROVE_LEVEL_1)
        const canApprovePaymentLevel2 = hasPermission(PERMISSION_CODES.PAYMENT_APPROVE_LEVEL_2)
        const canApprovePaymentFinal = hasPermission(PERMISSION_CODES.PAYMENT_APPROVE_FINAL)
        const canUploadBankNotes = hasPermission(PERMISSION_CODES.PAYMENT_UPLOAD_BANK_NOTE)
        const isOwner = Boolean(sub && (paymentData.requestorId === sub || paymentData.createdBy === sub))
        const isDraft = status === PAYMENT_REQUEST_STATUS_DRAFT
        const terminal = TERMINAL_PAYMENT_STATUSES.has(status)
        const bankNotesOnly = PAYMENT_STATUSES_BANK_NOTE_ONLY.has(status) && !terminal
        const canEditAllFields = isDraft && (isOwner || canCreatePayment)
        const canApproveLevel1 =
            !terminal &&
            (status === PAYMENT_REQUEST_STATUS_SUBMITTED || status === PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL) &&
            canApprovePaymentLevel1
        const canApproveLevel2 = !terminal && status === PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL && canApprovePaymentLevel2
        const canApproveFinal = !terminal && status === PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL && canApprovePaymentFinal
        const canInteractBankNotesWhenRestricted = bankNotesOnly && canUploadBankNotes
        const sectionLock: 'full' | 'readonly' | 'banknotes-only' = canEditAllFields
            ? 'full'
            : bankNotesOnly && canInteractBankNotesWhenRestricted
                ? 'banknotes-only'
                : 'readonly'

        return {
            sectionLock,
            formFieldsEditable: canEditAllFields,
            canShowSubmitToAccountant: isDraft && (isOwner || canCreatePayment),
            canApproveLevel1,
            canApproveLevel2,
            canApproveFinal,
            bankNotesOnly,
            ownerNonDraftReadOnlyHint: !isDraft && isOwner && !canCreatePayment && !bankNotesOnly,
            canUploadBankNotes,
        }
    }, [paymentData])

    const statusMeta = useMemo(() => {
        if (!paymentData?.status) return DEFAULT_STATUS_STYLE
        return PAYMENT_REQUEST_STATUS_STYLES[paymentData.status] ?? DEFAULT_STATUS_STYLE
    }, [paymentData?.status])

    const roleHint = useMemo<RoleHint | null>(() => {
        if (!paymentData) return null
        if (access.sectionLock === 'banknotes-only') {
            return {
                tone: 'info',
                title: 'Bạn đang ở chế độ tải bank note',
                description: 'Giai đoạn này chỉ kế toán / kế toán trưởng tải bank note (chứng từ thanh toán). Các nội dung khác đã khóa.',
            }
        }
        if (access.ownerNonDraftReadOnlyHint) {
            return {
                tone: 'muted',
                title: 'Chế độ xem',
                description: 'Đề nghị đã gửi: bạn chỉ xem. Chỉ kế toán / kế toán trưởng mới duyệt trên hệ thống.',
            }
        }
        if (access.canApproveLevel1 || access.canApproveLevel2 || access.canApproveFinal) {
            return {
                tone: 'warn',
                title: access.canApproveLevel1
                    ? 'Chờ bạn duyệt (Cấp 1)'
                    : access.canApproveLevel2
                        ? 'Chờ bạn duyệt (Cấp 2)'
                        : 'Chờ bạn duyệt cuối',
                description: 'Kiểm tra chứng từ, số tiền và ngân hàng rồi bấm Duyệt hoặc Từ chối.',
            }
        }
        if (access.formFieldsEditable) {
            return {
                tone: 'success',
                title: 'Đề nghị ở trạng thái nháp',
                description: 'Bạn có thể chỉnh sửa mọi thông tin. Sau khi kiểm tra, hãy gửi kế toán để bắt đầu quy trình duyệt.',
            }
        }
        return null
    }, [paymentData, access])

    const noteTokens = useMemo(() => parseNoteTokens(paymentData?.notes), [paymentData?.notes])

    const approvalStepLabel = useMemo(() => {
        if (!paymentData) return ''
        const levels = Number(paymentData.approvalLevels ?? 0)
        const current = Number(paymentData.currentApprovalLevel ?? 0)
        if (levels <= 0) return ''
        return `Cấp ${Math.min(current, levels)}/${levels}`
    }, [paymentData])

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
        if (access.canApproveLevel1) return 'Bạn đang duyệt với quyền PAYMENT_APPROVE_LEVEL_1. '
        if (access.canApproveLevel2) return 'Bạn đang duyệt với quyền PAYMENT_APPROVE_LEVEL_2. '
        if (access.canApproveFinal) return 'Bạn đang duyệt với quyền PAYMENT_APPROVE_FINAL. '
        return ''
    }, [access.canApproveFinal, access.canApproveLevel1, access.canApproveLevel2])

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

    const handleExportDeNghiPdf = useCallback(async () => {
        if (!paymentData) return
        if (items.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Chưa có dòng thanh toán',
                description: 'Thêm dòng PO trước khi xuất PDF.',
            })
            return
        }
        const dateIso = requestDate || moment(paymentData.requestDate).format('YYYY-MM-DD')
        setIsPdfExporting(true)
        try {
            await downloadPaymentDeNghiThanhToanPdf(
                {
                    requestNumber: paymentData.requestNumber,
                    requestDateIso: dateIso,
                    requestorLabel: (paymentData.createdBy || paymentData.requestorId || '—').trim(),
                    departmentLabel: '—',
                    purpose: purpose.trim() || '—',
                    currency,
                    paymentPercentage,
                    amountGoods: amount,
                    requestedAmount,
                    feeAmount,
                    fees: paymentData.fees,
                    totalAmountVnd,
                    exchangeRate: Number(exchangeRate ?? 1),
                    items: items.map((i) => ({
                        line: i._line,
                        selectedDocumentTypes: i.selectedDocumentTypes ?? [],
                        purchaseOrders: paymentData.purchaseOrders ?? [],
                    })),
                    approvals: paymentData.approvals,
                    createdBy: paymentData.createdBy || '—',
                },
                `De-nghi-thanh-toan-${paymentData.requestNumber}`,
            )
            toast({ title: 'Đã xuất PDF', description: 'Mẫu Đề nghị thanh toán (IES).', variant: 'success' })
        } catch {
            toast({ variant: 'destructive', title: 'Không xuất được PDF', description: 'Vui lòng thử lại.' })
        } finally {
            setIsPdfExporting(false)
        }
    }, [
        paymentData,
        items,
        requestDate,
        purpose,
        currency,
        paymentPercentage,
        amount,
        requestedAmount,
        feeAmount,
        totalAmountVnd,
        exchangeRate,
        toast,
    ])

    const formFieldsEditable = access.formFieldsEditable
    const canSave =
        (formFieldsEditable && isDirty) || (access.sectionLock === 'banknotes-only' && bankNotePending.length > 0)

    const isInitialLoading = isLoading && !paymentData

    const saveDisabledReason = useMemo(() => {
        if (isSaving || isReviewMutating) return 'Đang xử lý, vui lòng chờ...'
        if (access.sectionLock === 'banknotes-only') {
            if (bankNotePending.length === 0) return 'Hãy chọn file bank note để tải lên.'
            return ''
        }
        if (!formFieldsEditable) return 'Bạn không có quyền chỉnh sửa ở trạng thái hiện tại.'
        if (!purpose.trim()) return 'Vui lòng nhập Nhà cung cấp / Mục đích thanh toán.'
        if (!isDirty) return 'Không có thay đổi mới để lưu.'
        return ''
    }, [isSaving, isReviewMutating, access.sectionLock, bankNotePending.length, formFieldsEditable, purpose, isDirty])

    if (isInitialLoading) {
        return (
            <div className="pb-28">
                <HeaderPageLayout title="Cập nhật đề nghị thanh toán" buttonSubmit={null} />
                <div className="mt-4 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-6">
                        <Skeleton className="col-span-2 h-64" />
                        <Skeleton className="col-span-2 h-64" />
                        <Skeleton className="col-span-2 h-64" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    const exchangeRatePreview = currency !== 'VND' && exchangeRate > 0
        ? `1 ${currency} ≈ ${numberWithCommas(exchangeRate)} VND`
        : ''

    return (
        <div className="pb-28">
            <HeaderPageLayout
                title={paymentData?.requestNumber ? `Đề nghị thanh toán ${paymentData.requestNumber}` : 'Cập nhật đề nghị thanh toán'}
                buttonSubmit={null}
                otherButton={
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!paymentData || items.length === 0 || isPdfExporting}
                        className="gap-1"
                        onClick={() => void handleExportDeNghiPdf()}
                    >
                        {isPdfExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileDown className="h-4 w-4" />
                        )}
                        Xuất PDF
                    </Button>
                }
            />

            {/* Rich overview: status pill + key meta */}
            {paymentData && (
                <Card className="mt-4 border-border/60">
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                            <span className={cn('rounded-md px-3 py-1 text-xs font-bold shadow-sm', statusMeta.style)}>
                                {statusMeta.label}
                            </span>
                            {approvalStepLabel && (
                                <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/60 px-2.5 py-1 text-xs font-medium">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    {approvalStepLabel}
                                </span>
                            )}
                            {access.sectionLock === 'readonly' && !access.canApproveLevel1 && !access.canApproveLevel2 && !access.canApproveFinal && (
                                <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    <Eye className="h-3.5 w-3.5" />
                                    Chỉ xem
                                </span>
                            )}
                            {purpose && (
                                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs text-foreground">
                                    <span className="uppercase text-[10px] tracking-wide text-muted-foreground">NCC</span>
                                    <span className="truncate font-medium">{purpose}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Ngày tạo</span>
                                <span className="font-medium">
                                    {paymentData.requestDate ? moment(paymentData.requestDate).format('DD/MM/YYYY') : '—'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Số dòng PO</span>
                                <span className="font-medium tabular-nums">{items.length}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Hình thức</span>
                                <span className="font-medium">{paymentMode === 'FULL' ? 'Toàn bộ (100%)' : `${paymentPercentage}%`}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tổng thanh toán (VND)</span>
                                <span className="text-base font-bold text-primary tabular-nums">{formatCurrencyVN(totalAmountVnd)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <RoleHintBanner hint={roleHint} />

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-6">
                <Card className="col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm uppercase">
                            <Info className="h-4 w-4" />
                            Thông tin đề nghị
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {formFieldsEditable ? (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Mã đề nghị</Label>
                                        <Input className="h-8 text-xs" value={paymentData?.requestNumber ?? ''} disabled />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Nhà cung cấp / Mục đích <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="VD: Tên NCC hoặc mục đích thanh toán"
                                            value={purpose}
                                            onChange={(e) => { setPurpose(e.target.value); touch() }}
                                        />
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
                                            className="h-8 text-xs tabular-nums"
                                            value={exchangeRate}
                                            onChange={(e) => { setExchangeRate(Number(e.target.value)); touch() }}
                                            disabled={currency === 'VND'}
                                        />
                                        {exchangeRatePreview && (
                                            <p className="text-[10px] text-muted-foreground">{exchangeRatePreview}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Hạn thanh toán</Label>
                                        <Input
                                            type="date"
                                            className="h-8 text-xs"
                                            value={requestDate}
                                            onChange={(e) => { setRequestDate(e.target.value); touch() }}
                                        />
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
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <DisplayField label="Mã đề nghị" value={paymentData?.requestNumber} mono />
                                <DisplayField label="Nhà cung cấp / Mục đích" value={purpose} required />
                                <DisplayField label="Tiền tệ" value={currency} />
                                <DisplayField
                                    label="Tỷ giá"
                                    value={currency === 'VND' ? '—' : numberWithCommas(exchangeRate)}
                                    hint={exchangeRatePreview || undefined}
                                />
                                <DisplayField
                                    label="Hạn thanh toán"
                                    value={requestDate ? moment(requestDate).format('DD/MM/YYYY') : ''}
                                />
                                <DisplayField label="Số cấp duyệt" value={approvalLevels ? `${approvalLevels} cấp` : ''} />
                                <DisplayField
                                    className="col-span-2"
                                    label="Hình thức thanh toán"
                                    value={
                                        <span className="inline-flex items-center gap-2">
                                            <span>{paymentMode === 'FULL' ? 'Thanh toán toàn bộ' : 'Thanh toán một phần'}</span>
                                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
                                                {paymentPercentage}%
                                            </span>
                                        </span>
                                    }
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className={!hasLoadedLines ? 'opacity-60 col-span-2' : 'col-span-2'}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm uppercase">
                            <BanknoteIcon className="h-4 w-4" />
                            Thông tin ngân hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {formFieldsEditable ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {BANK_FIELDS.map(({ field, label }) => (
                                    <div key={field} className="space-y-1">
                                        <Label className="text-xs">{label}</Label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={bankInfo[field]}
                                            placeholder={`Nhập ${label.toLowerCase()}`}
                                            onChange={(e) => { setBankInfo((b) => ({ ...b, [field]: e.target.value })); touch() }}
                                            disabled={!hasLoadedLines}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : hasAnyBankInfo(bankInfo) ? (
                            <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                                {BANK_FIELDS.map(({ field, label }) => (
                                    <DisplayField key={field} label={label} value={bankInfo[field]} mono={field === 'accountNumber'} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-6 text-center">
                                <BanknoteIcon className="mb-2 h-6 w-6 text-muted-foreground/60" />
                                <p className="text-xs font-medium text-muted-foreground">Chưa có thông tin ngân hàng</p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">Đề nghị này không đính kèm thông tin chuyển khoản.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {paymentData && (
                    <div className="col-span-2 flex flex-col gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between gap-2 text-sm uppercase">
                                    <span className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Số chứng từ
                                    </span>
                                    {noteTokens.length > 0 && (
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                                            {noteTokens.length}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {noteTokens.length === 0 ? (
                                    <div className="flex items-center justify-center rounded-md border border-dashed py-4 text-center">
                                        <p className="text-xs text-muted-foreground">Chưa có số chứng từ đính kèm</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {noteTokens.map((token, index) => (
                                            <span
                                                key={`${token}-${index}`}
                                                className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-medium text-primary"
                                            >
                                                <FileText className="h-3 w-3 opacity-70" />
                                                {token}
                                            </span>
                                        ))}
                                    </div>
                                )}
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
                <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="flex min-w-0 flex-1 items-center gap-x-5 gap-y-2 overflow-x-auto text-sm">
                        <FooterStat label="Dòng PO">
                            <span className="font-medium text-foreground tabular-nums">{hasLoadedLines ? items.length : '—'}</span>
                        </FooterStat>
                        <FooterStat label="Hình thức">
                            <span className="font-medium text-foreground">{paymentMode === 'FULL' ? 'Toàn bộ' : `${paymentPercentage}%`}</span>
                        </FooterStat>
                        <FooterStat label="Tiền hàng">
                            <span className="font-medium text-foreground tabular-nums">{numberWithCommas(amount)} {currency}</span>
                        </FooterStat>
                        <FooterStat label={`Đề nghị TT (${paymentPercentage}%)`}>
                            <span className="font-semibold text-foreground tabular-nums">{numberWithCommas(requestedAmount)} {currency}</span>
                        </FooterStat>
                        {feeAmount > 0 && (
                            <FooterStat label="Phí">
                                <span className="font-medium text-foreground tabular-nums">{numberWithCommas(feeAmount)} {currency}</span>
                            </FooterStat>
                        )}
                        <FooterStat label="Tổng cộng (VND)">
                            <span className="font-bold text-primary tabular-nums">{formatCurrencyVN(totalAmountVnd)}</span>
                        </FooterStat>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => void loadData()} disabled={isLoading || isSaving || isReviewMutating}>
                            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => history.back()} disabled={isSaving || isReviewMutating}>
                            Quay lại
                        </Button>
                        {(formFieldsEditable || access.sectionLock === 'banknotes-only') && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex">
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
                                    </span>
                                </TooltipTrigger>
                                {saveDisabledReason && (
                                    <TooltipContent>{saveDisabledReason}</TooltipContent>
                                )}
                            </Tooltip>
                        )}
                        {(access.canApproveLevel1 || access.canApproveLevel2 || access.canApproveFinal) && (
                            <>
                                <Separator orientation="vertical" className="mx-1 h-6" />
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex">
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
                                    </span>
                                </TooltipTrigger>
                                {isDirty && (
                                    <TooltipContent>
                                        Vui lòng lưu các thay đổi trước khi gửi kế toán.
                                    </TooltipContent>
                                )}
                            </Tooltip>
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

            {(access.canApproveLevel1 || access.canApproveLevel2 || access.canApproveFinal) && paymentData?.id && (
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
