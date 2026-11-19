import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useDeletePurchaseOrder } from "@/hooks/use-purchase"
import { IPurchaseOrderResponse } from "@/types/purchase"

type Props = {
    purchase: IPurchaseOrderResponse
    refetch: () => void
}

const ConfirmDeletePurchase = ({ purchase, refetch }: Props) => {
    const { mutateAsync, isPending } = useDeletePurchaseOrder()

    const onConfirm = async () => {
        await mutateAsync(purchase.id)
        refetch()
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div className="relative hover:bg-red-500 hover:text-white flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-red-600">
                    Xoá
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xoá đơn mua hàng</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm space-y-2">
                    <div className="flex gap-x-4">
                        <span className="text-muted-foreground">Mã PO:</span>
                        <span className="font-medium">
                            {purchase.poPrefix}.{String(purchase.poNumber).padStart(3, '0')}
                        </span>
                    </div>
                    <div className="flex gap-x-4">
                        <span className="text-muted-foreground">Trạng thái:</span>
                        <span>{purchase.status}</span>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isPending}
                        onClick={(e) => {
                            e.preventDefault()
                            void onConfirm()
                        }}
                        className="bg-red-600 text-white hover:bg-red-500"
                    >
                        Đồng ý
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDeletePurchase
