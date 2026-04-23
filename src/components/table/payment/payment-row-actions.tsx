import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ConfirmSubmitToAccountant from "@/components/modal/payment/confirm-submit-to-accountant"
import { PAYMENT_REQUEST_STATUS_DRAFT } from "@/lib/constants"
import { IPaymentRequestInfo } from "@/types/payment"
import { MoreVertical } from "lucide-react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"

export default function PaymentRowActions({ payment }: { payment: IPaymentRequestInfo & { refetch?: () => void } }) {
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const isDraft = payment.status === PAYMENT_REQUEST_STATUS_DRAFT

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
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="text-orange-400">
                        <Link to="/payment/$paymentId" params={{ paymentId: payment.id as string }}>Cập nhật</Link>
                    </DropdownMenuItem>
                    {isDraft && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowSubmitModal(true)}
                            >
                                {/* <Send className="mr-2 h-4 w-4" /> */}
                                <span className="text-emerald-600">Gửi kế toán</span>
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Xoá</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmSubmitToAccountant
                open={showSubmitModal}
                onOpenChange={setShowSubmitModal}
                paymentData={payment}
                onSuccess={payment.refetch}
            />
        </>
    )
}
