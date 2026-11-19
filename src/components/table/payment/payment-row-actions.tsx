import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ConfirmSubmitToAccountant from "@/components/modal/payment/confirm-submit-to-accountant"
import ConfirmCancelPayment from "@/components/modal/payment/confirm-cancel-payment"
import MarkPaymentPaidDialog from "@/components/modal/payment/mark-payment-paid-dialog"
import {
    PAYMENT_REQUEST_STATUS_APPROVED,
    PAYMENT_REQUEST_STATUS_DRAFT,
    PAYMENT_REQUEST_STATUS_PARTIALLY_PAID,
    PAYMENT_REQUEST_STATUS_REJECTED,
    PAYMENT_REQUEST_STATUS_SUBMITTED,
} from "@/lib/constants"
import { IPaymentRequestInfo } from "@/types/payment"
import { MoreVertical } from "lucide-react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"

const CANCELLABLE = new Set([
    PAYMENT_REQUEST_STATUS_DRAFT,
    PAYMENT_REQUEST_STATUS_REJECTED,
    PAYMENT_REQUEST_STATUS_SUBMITTED,
])

const MARKABLE = new Set([
    PAYMENT_REQUEST_STATUS_APPROVED,
    PAYMENT_REQUEST_STATUS_PARTIALLY_PAID,
])

export default function PaymentRowActions({ payment }: { payment: IPaymentRequestInfo & { refetch?: () => void } }) {
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
    const isDraft = payment.status === PAYMENT_REQUEST_STATUS_DRAFT
    const canCancel = CANCELLABLE.has(payment.status)
    const canMarkPaid = MARKABLE.has(payment.status)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="bg-transparent">
                    <Button
                        aria-haspopup="true"
                        size="sm"
                        variant="ghost"
                    >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="text-orange-400">
                        <Link to="/payment/$paymentId" params={{ paymentId: payment.id as string }}>Cập nhật</Link>
                    </DropdownMenuItem>
                    {isDraft && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowSubmitModal(true)}>
                                <span className="text-emerald-600">Gửi kế toán</span>
                            </DropdownMenuItem>
                        </>
                    )}
                    {canMarkPaid && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowMarkPaidModal(true)}>
                                <span className="text-emerald-600">Ghi nhận đã thanh toán</span>
                            </DropdownMenuItem>
                        </>
                    )}
                    {canCancel && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setShowCancelModal(true)}
                            >
                                Hủy đề nghị
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmSubmitToAccountant
                open={showSubmitModal}
                onOpenChange={setShowSubmitModal}
                paymentData={payment}
                onSuccess={payment.refetch}
            />
            <ConfirmCancelPayment
                open={showCancelModal}
                onOpenChange={setShowCancelModal}
                paymentData={payment}
                onSuccess={payment.refetch}
            />
            <MarkPaymentPaidDialog
                open={showMarkPaidModal}
                onOpenChange={setShowMarkPaidModal}
                paymentData={payment}
                onSuccess={payment.refetch}
            />
        </>
    )
}
