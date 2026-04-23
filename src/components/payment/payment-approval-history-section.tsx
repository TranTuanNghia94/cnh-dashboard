import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PAYMENT_REQUEST_STATUS_APPROVED, PAYMENT_REQUEST_STATUS_REJECTED } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { IPaymentRequestApprovalInfo } from '@/types/payment'
import { CheckCircle2, History, XCircle } from 'lucide-react'
import moment from 'moment'
import { useMemo } from 'react'

function formatWhen(iso: string | undefined) {
    if (!iso) return '—'
    const m = moment(iso)
    return m.isValid() ? m.format('DD/MM/YYYY HH:mm') : '—'
}

function statusLabel(status: string | undefined) {
    if (status === PAYMENT_REQUEST_STATUS_APPROVED) return 'Đã duyệt'
    if (status === PAYMENT_REQUEST_STATUS_REJECTED) return 'Từ chối'
    return status?.trim() || '—'
}

type PaymentApprovalHistorySectionProps = {
    approvals?: IPaymentRequestApprovalInfo[]
    approvalLevels?: number
}

export default function PaymentApprovalHistorySection({ approvals, approvalLevels }: PaymentApprovalHistorySectionProps) {
    const rows = useMemo(
        () => [...(approvals ?? [])].sort((a, b) => Number(a.level) - Number(b.level)),
        [approvals],
    )

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm uppercase">
                    <History className="h-4 w-4 shrink-0" />
                    Lịch sử duyệt
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {rows.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        Chưa có bản ghi duyệt
                        {approvalLevels != null && approvalLevels > 0 ? ` (cấu hình ${approvalLevels} cấp).` : '.'}
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {rows.map((a) => {
                            const approved = a.status === PAYMENT_REQUEST_STATUS_APPROVED
                            const rejected = a.status === PAYMENT_REQUEST_STATUS_REJECTED
                            const who = a.updatedBy?.trim() || '—'
                            return (
                                <li
                                    key={a.id}
                                    className={cn(
                                        'rounded-md border p-3 text-xs',
                                        rejected && 'border-destructive/30 bg-destructive/5',
                                        approved && !rejected && 'border-emerald-600/25 bg-emerald-600/5',
                                        !approved && !rejected && 'border-border bg-muted/30',
                                    )}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-foreground">Cấp {a.level}</span>
                                            {approved && (
                                                <Badge variant="success" className="gap-1 font-normal">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Đã duyệt
                                                </Badge>
                                            )}
                                            {rejected && (
                                                <Badge variant="destructive" className="gap-1 font-normal">
                                                    <XCircle className="h-3 w-3" />
                                                    Từ chối
                                                </Badge>
                                            )}
                                            {!approved && !rejected && (
                                                <Badge variant="secondary" className="font-normal">
                                                    {statusLabel(a.status)}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="tabular-nums text-muted-foreground">{formatWhen(a.approvedAt)}</span>
                                    </div>
                                    <p className="mt-2 text-muted-foreground">
                                        <span className="text-foreground/80">Người duyệt:</span> {who}
                                    </p>
                                    {rejected && a.rejectionReason?.trim() && (
                                        <p className="mt-1.5 text-destructive">
                                            <span className="font-medium">Lý do:</span> {a.rejectionReason.trim()}
                                        </p>
                                    )}
                                    {a.note?.trim() && (
                                        <p className="mt-1.5 text-muted-foreground">
                                            <span className="font-medium text-foreground/80">Ghi chú:</span> {a.note.trim()}
                                        </p>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
