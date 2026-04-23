import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSendPaymentRequestToAccountant } from '@/hooks/use-payment'
import { formatCurrencyVN } from '@/lib/other'
import { IPaymentRequestInfo } from '@/types/payment'
import { Loader2, Send } from 'lucide-react'
import moment from 'moment'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentData: IPaymentRequestInfo
    onSuccess?: () => void
}

export default function ConfirmSubmitToAccountant({ open, onOpenChange, paymentData, onSuccess }: Props) {
    const { mutateAsync, isPending } = useSendPaymentRequestToAccountant()

    const handleConfirm = async () => {
        await mutateAsync(paymentData.id)
        onOpenChange(false)
        onSuccess?.()
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Xác nhận gửi đề nghị thanh toán
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn gửi đề nghị thanh toán này cho kế toán duyệt?
                        Sau khi gửi, bạn sẽ không thể chỉnh sửa cho đến khi có phản hồi.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 rounded-md border p-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã đề nghị</span>
                        <span className="font-medium">{paymentData.requestNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Nhà cung cấp</span>
                        <span className="font-medium">{paymentData.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Hạn thanh toán</span>
                        <span className="font-medium">
                            {paymentData.requestDate ? moment(paymentData.requestDate).format('DD/MM/YYYY') : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tỷ lệ thanh toán</span>
                        <span className="font-medium">{paymentData.paidPercentage}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Tổng cộng (VND)</span>
                        <span className="font-bold text-primary">
                            {formatCurrencyVN(Number(paymentData.totalAmountVnd || 0))}
                        </span>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Gửi kế toán
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
