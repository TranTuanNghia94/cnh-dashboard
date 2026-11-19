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
import { useCancelPaymentRequest } from '@/hooks/use-payment'
import { IPaymentRequestInfo } from '@/types/payment'
import { Ban, Loader2 } from 'lucide-react'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentData: IPaymentRequestInfo
    onSuccess?: () => void
}

export default function ConfirmCancelPayment({ open, onOpenChange, paymentData, onSuccess }: Props) {
    const { mutateAsync, isPending } = useCancelPaymentRequest()

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
                        <Ban className="h-5 w-5 text-destructive" />
                        Hủy đề nghị thanh toán
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc muốn hủy đề nghị <span className="font-medium">{paymentData.requestNumber}</span>?
                        Thao tác này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Đóng</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang hủy...
                            </>
                        ) : (
                            'Xác nhận hủy'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
