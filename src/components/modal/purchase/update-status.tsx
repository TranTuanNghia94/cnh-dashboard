import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useUpdatePurchaseOrderStatus } from '@/hooks/use-purchase'
import { IPurchaseOrderResponse } from '@/types/purchase'
import { useState } from 'react'

const PO_STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Nháp',
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    ORDERED: 'Đã đặt hàng',
    PARTIALLY_RECEIVED: 'Nhận một phần',
    RECEIVED: 'Đã nhận hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
}

type Props = {
    purchase: IPurchaseOrderResponse
    refetch?: () => void
}

const UpdatePurchaseStatus = ({ purchase, refetch }: Props) => {
    const { mutateAsync, isPending } = useUpdatePurchaseOrderStatus()
    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(purchase.status)

    const onSubmit = async () => {
        await mutateAsync({ id: purchase.id, status: selectedStatus })
        setOpen(false)
        refetch?.()
    }

    return (
        <AlertDialog
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen)
                if (!isOpen) setSelectedStatus(purchase.status)
            }}
        >
            <AlertDialogTrigger asChild>
                <div className="relative text-orange-400 hover:text-white hover:bg-orange-400 flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors">
                    Đổi trạng thái
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Đổi trạng thái đơn mua hàng</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        PO {purchase.poPrefix}.{String(purchase.poNumber).padStart(3, '0')} — hiện tại:{' '}
                        <span className="font-medium text-foreground">
                            {PO_STATUS_LABELS[purchase.status] ?? purchase.status}
                        </span>
                    </p>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(PO_STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key} disabled={key === purchase.status}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={selectedStatus === purchase.status || isPending}
                        onClick={(e) => {
                            e.preventDefault()
                            void onSubmit()
                        }}
                    >
                        {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UpdatePurchaseStatus
