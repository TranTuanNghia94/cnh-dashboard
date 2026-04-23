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
import { Textarea } from '@/components/ui/textarea'
import { useApprovePaymentRequest } from '@/hooks/use-payment'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

export type ApprovePaymentRequestDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentRequestId: string | undefined
    /** Backend `currentApprovalLevel` (falls back to 1). */
    approvalLevel: number
    /** Short sentence describing the approver role (e.g. kế toán cấp 1). */
    roleDescription: string
    onSuccess?: () => void | Promise<void>
}

export function ApprovePaymentRequestDialog({
    open,
    onOpenChange,
    paymentRequestId,
    approvalLevel,
    roleDescription,
    onSuccess,
}: ApprovePaymentRequestDialogProps) {
    const { toast } = useToast()
    const { mutateAsync: approvePayment, isPending } = useApprovePaymentRequest()
    const [note, setNote] = useState('')

    useEffect(() => {
        if (!open) setNote('')
    }, [open])

    const handleConfirm = async () => {
        if (!paymentRequestId) return
        try {
            await approvePayment({
                id: paymentRequestId,
                body: {
                    level: Number(approvalLevel ?? 1),
                    note: note.trim(),
                },
            })
            toast({ title: 'Thao tác thành công', description: 'Đã duyệt đề nghị thanh toán.', variant: 'success' })
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
                        <UserCheck className="h-5 w-5 text-sky-600" />
                        Duyệt đề nghị thanh toán
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {roleDescription}
                        Có thể thêm ghi chú kèm theo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                    className="min-h-[80px] text-sm"
                    placeholder="Ghi chú duyệt (tuỳ chọn)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isPending}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
                    <Button type="button" size="sm" disabled={isPending} onClick={() => void handleConfirm()}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang duyệt...
                            </>
                        ) : (
                            'Xác nhận duyệt'
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
