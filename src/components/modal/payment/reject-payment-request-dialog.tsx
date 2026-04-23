import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRejectPaymentRequest } from '@/hooks/use-payment'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Ban } from 'lucide-react'
import { useEffect, useState } from 'react'

export type RejectPaymentRequestDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentRequestId: string | undefined
    approvalLevel: number
    roleDescription: string
    onSuccess?: () => void | Promise<void>
}

export function RejectPaymentRequestDialog({
    open,
    onOpenChange,
    paymentRequestId,
    approvalLevel,
    roleDescription,
    onSuccess,
}: RejectPaymentRequestDialogProps) {
    const { toast } = useToast()
    const { mutateAsync: rejectPayment, isPending } = useRejectPaymentRequest()
    const [reason, setReason] = useState('')
    const [note, setNote] = useState('')

    useEffect(() => {
        if (!open) {
            setReason('')
            setNote('')
        }
    }, [open])

    const canSubmit = reason.trim().length > 0

    const handleConfirm = async () => {
        if (!paymentRequestId || !canSubmit) return
        try {
            await rejectPayment({
                id: paymentRequestId,
                body: {
                    level: Number(approvalLevel ?? 1),
                    reason: reason.trim(),
                    note: note.trim(),
                },
            })
            toast({ title: 'Thao tác thành công', description: 'Đã từ chối đề nghị thanh toán.', variant: 'success' })
            onOpenChange(false)
            await onSuccess?.()
        } catch {
            // Hook already toasts errors
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Ban className="h-5 w-5 text-destructive" />
                        Từ chối đề nghị thanh toán
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {roleDescription}
                        Vui lòng nhập lý do từ chối. Ghi chú thêm là tuỳ chọn.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="reject-reason" className="text-xs">
                            Lý do từ chối <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="reject-reason"
                            className="h-9 text-sm"
                            placeholder="Ví dụ: thiếu chứng từ, sai số tiền..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="reject-note" className="text-xs">
                            Ghi chú thêm
                        </Label>
                        <Textarea
                            id="reject-note"
                            className="min-h-[72px] text-sm"
                            placeholder="Tuỳ chọn"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isPending || !canSubmit}
                        onClick={() => void handleConfirm()}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang từ chối...
                            </>
                        ) : (
                            'Xác nhận từ chối'
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
