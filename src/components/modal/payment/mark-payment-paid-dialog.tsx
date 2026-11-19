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
import { useMarkPaymentPaid } from '@/hooks/use-payment'
import { formatCurrencyVN } from '@/lib/other'
import { IPaymentBankNoteObject, IPaymentFileObject, IPaymentRequestInfo } from '@/types/payment'
import { BanknoteIcon, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    paymentData: IPaymentRequestInfo
    bankNoteFiles?: IPaymentFileObject[]
    onSuccess?: () => void
}

export default function MarkPaymentPaidDialog({
    open,
    onOpenChange,
    paymentData,
    bankNoteFiles = [],
    onSuccess,
}: Props) {
    const { mutateAsync, isPending } = useMarkPaymentPaid()
    const remaining = useMemo(() => {
        const total = Number(paymentData.totalAmount ?? 0)
        const paid = Number(paymentData.paidAmount ?? 0)
        return Math.max(total - paid, 0)
    }, [paymentData.paidAmount, paymentData.totalAmount])

    const [paidAmount, setPaidAmount] = useState(String(remaining || ''))
    const [exchangeRate, setExchangeRate] = useState(String(paymentData.exchangeRate || 1))
    const [transactionRef, setTransactionRef] = useState(paymentData.bankNote?.transactionRef ?? '')
    const [note, setNote] = useState(paymentData.bankNote?.note ?? '')

    useEffect(() => {
        if (!open) return
        setPaidAmount(String(remaining || ''))
        setExchangeRate(String(paymentData.exchangeRate || 1))
        setTransactionRef(paymentData.bankNote?.transactionRef ?? '')
        setNote(paymentData.bankNote?.note ?? '')
    }, [open, paymentData.bankNote, paymentData.exchangeRate, remaining])

    const handleConfirm = async () => {
        const amount = Number(paidAmount)
        const rate = Number(exchangeRate)
        if (!Number.isFinite(amount) || amount <= 0) return
        if (paymentData.currency !== 'VND' && (!Number.isFinite(rate) || rate <= 0)) return

        const bankNote: IPaymentBankNoteObject = {
            transactionRef: transactionRef.trim(),
            note: note.trim(),
            attachments: bankNoteFiles.length
                ? bankNoteFiles
                : (paymentData.bankNote?.attachments ?? []),
        }

        await mutateAsync({
            id: paymentData.id,
            body: {
                paidAmount: amount,
                exchangeRate: paymentData.currency === 'VND' ? 1 : rate,
                bankNote,
            },
        })
        onOpenChange(false)
        onSuccess?.()
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <BanknoteIcon className="h-5 w-5 text-emerald-600" />
                        Ghi nhận đã thanh toán
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Đề nghị <span className="font-medium">{paymentData.requestNumber}</span>. Còn lại{' '}
                        <span className="font-medium">
                            {formatCurrencyVN(remaining)} {paymentData.currency || 'VND'}
                        </span>
                        .
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="paidAmount">Số tiền thanh toán *</Label>
                        <Input
                            id="paidAmount"
                            type="number"
                            min={0}
                            step="any"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                        />
                    </div>
                    {paymentData.currency !== 'VND' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="exchangeRate">Tỷ giá *</Label>
                            <Input
                                id="exchangeRate"
                                type="number"
                                min={0}
                                step="any"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="transactionRef">Mã giao dịch / bank note</Label>
                        <Input
                            id="transactionRef"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            placeholder="Số tham chiếu chuyển khoản"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="paidNote">Ghi chú</Label>
                        <Input
                            id="paidNote"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    {bankNoteFiles.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Đã đính kèm {bankNoteFiles.length} file bank note.
                        </p>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Đóng</AlertDialogCancel>
                    <Button
                        type="button"
                        onClick={() => void handleConfirm()}
                        disabled={isPending || Number(paidAmount) <= 0}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang ghi nhận...
                            </>
                        ) : (
                            'Xác nhận đã thanh toán'
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
