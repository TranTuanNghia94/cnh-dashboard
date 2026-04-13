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
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useUpdateOrderStatus } from '@/hooks/use-order'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/constants'
import { IOrderResponse } from '@/types/order'
import { CheckCircle2, Circle, MoveRight, XCircle } from 'lucide-react'
import React, { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Props = {
    orderData: IOrderResponse
    refetch?: () => void
}

const STATUS_ORDER = ['DRAFT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'SHIPPED', 'COMPLETED']

const UpdateOrderStatus = ({ orderData, refetch }: Props) => {
    const { mutateAsync, isPending } = useUpdateOrderStatus()
    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>(orderData.status)

    const currentStatusIndex = STATUS_ORDER.indexOf(orderData.status)

    const getStatusIcon = (status: string) => {
        const statusIndex = STATUS_ORDER.indexOf(status)

        if (status === 'CANCELLED') {
            return orderData.status === 'CANCELLED'
                ? <XCircle className="h-6 w-6 text-rose-500" />
                : <Circle className="h-6 w-6 text-muted-foreground" />
        }

        if (statusIndex <= currentStatusIndex && orderData.status !== 'CANCELLED') {
            return <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        }

        return <Circle className="h-6 w-6 text-muted-foreground" />
    }

    const handleSelect = (value: string) => {
        setSelectedStatus(value)
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setSelectedStatus(orderData.status)
        }
    }

    const onSubmit = async () => {
        await mutateAsync({
            id: orderData.id,
            status: selectedStatus,
        })
        setOpen(false)
        refetch?.()
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <div className="relative text-orange-400 hover:text-white hover:bg-orange-400 flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Đổi trạng thái
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận đổi trạng thái đơn hàng</AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Mã đơn hàng:</span>
                        <span className="font-medium">{orderData.orderPrefix}{orderData.orderNumber}</span>
                        <span className="text-muted-foreground ml-4">Trạng thái hiện tại:</span>
                        <span className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium shadow-md",
                            ORDER_STATUS_STYLES[orderData.status] || ORDER_STATUS_STYLES.DEFAULT
                        )}>
                            {ORDER_STATUS_LABELS[orderData.status] || orderData.status}
                        </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between px-4">
                        {STATUS_ORDER.map((status, index) => (
                            <React.Fragment key={status}>
                                <div className="flex flex-col items-center gap-2">
                                    {getStatusIcon(status)}
                                    <span className={cn(
                                        "text-xs text-center",
                                        STATUS_ORDER.indexOf(status) <= currentStatusIndex && orderData.status !== 'CANCELLED'
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground"
                                    )}>
                                        {ORDER_STATUS_LABELS[status]}
                                    </span>
                                </div>
                                {index < STATUS_ORDER.length - 1 && (
                                    <MoveRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chọn trạng thái mới</label>
                        <Select onValueChange={handleSelect} value={selectedStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Trạng thái</SelectLabel>
                                    {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                                        <SelectItem
                                            key={key}
                                            value={key}
                                            disabled={key === orderData.status}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    key === 'DRAFT' && "bg-amber-500",
                                                    key === 'PENDING' && "bg-blue-500",
                                                    key === 'PARTIALLY_PAID' && "bg-orange-500",
                                                    key === 'PAID' && "bg-emerald-500",
                                                    key === 'SHIPPED' && "bg-green-500",
                                                    key === 'COMPLETED' && "bg-primary/10 text-primary",
                                                    key === 'CANCELLED' && "bg-rose-500",
                                                    key === 'REJECTED' && "bg-red-500"
                                                )} />
                                                {label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedStatus !== orderData.status && (
                        <div className="p-3 rounded-md bg-muted text-sm">
                            <span className="text-muted-foreground">Thay đổi: </span>
                            <span className={cn(
                                "px-2 py-1 rounded text-xs font-medium shadow-md",
                                ORDER_STATUS_STYLES[orderData.status] || ORDER_STATUS_STYLES.DEFAULT
                            )}>
                                {ORDER_STATUS_LABELS[orderData.status]}
                            </span>
                            <MoveRight className="inline h-4 w-4 mx-2 text-muted-foreground" />
                            <span className={cn(
                                "px-2 py-1 rounded text-xs font-medium shadow-md",
                                ORDER_STATUS_STYLES[selectedStatus] || ORDER_STATUS_STYLES.DEFAULT
                            )}>
                                {ORDER_STATUS_LABELS[selectedStatus]}
                            </span>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onSubmit}
                        disabled={selectedStatus === orderData.status || isPending}
                    >
                        {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UpdateOrderStatus