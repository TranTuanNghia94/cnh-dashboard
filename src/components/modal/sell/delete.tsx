import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useDeleteSell } from "@/hooks/use-sell"
import { useToast } from "@/hooks/use-toast"
import { ISellResponse } from "@/types/sell"
import { useEffect } from "react"


type Props = {
    sell: ISellResponse
    refetch: () => void
}

const ConfirmDeleteSell = ({ sell, refetch }: Props) => {
    const { mutateAsync, isSuccess, data } = useDeleteSell()
    const { toast } = useToast()

    useEffect(() => {
        if (isSuccess && data) {
            toast({
                title: 'Thao tác thành công',
                description: 'Cập nhật thành công',
                variant: 'success',
            })

            refetch()
        }
    }, [isSuccess, data])


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div className="relative hover:bg-red-500 hover:text-white flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600">
                    Xoá
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xoá dữ liệu</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm">
                    <div className="flex gap-x-8">
                        <div>Số hợp đồng:</div>
                        <div>{sell?.soHopDong}</div>
                    </div>
                    <div className="flex gap-x-8 my-2">
                        <div>Khách hàng: </div>
                        <div>{sell?.KhachHang?.maKhachHang}</div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => mutateAsync(sell.id as string)} className="bg-red-600 text-white hover:bg-red-500">Đồng ý</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDeleteSell;