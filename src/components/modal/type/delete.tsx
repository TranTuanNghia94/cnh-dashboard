import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useDeleteType } from "@/hooks/use-type"
import { IGroupOfGoodsResponse } from "@/types/type"
import { useEffect } from "react"

type Props = {
    type: IGroupOfGoodsResponse
    refetch: () => void
}

const ConfirmDeleteType = ({ type, refetch }: Props) => {
    const { mutateAsync, isSuccess, data } = useDeleteType()
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
                        <div>Tên nhóm hàng:</div>
                        <div>{type?.ten}</div>
                    </div>
                    <div className="flex gap-x-8 my-2">
                        <div>Đơn vị</div>
                        <div>{type?.donViTinh}</div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => mutateAsync(type.id)} className="bg-red-600 text-white hover:bg-red-500">Đồng ý</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDeleteType;