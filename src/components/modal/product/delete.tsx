import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useDeleteProduct } from "@/hooks/use-product"
import { useToast } from "@/hooks/use-toast"
import { IProductResponse } from "@/types/product"
import { useEffect } from "react"

type Props = {
    product: IProductResponse
    refetch: () => void
}

const ConfirmDeleteProduct = ({ product, refetch }: Props) => {
    const { mutateAsync, isSuccess, data } = useDeleteProduct()
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
            <AlertDialogContent className="w-[300%]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">Xác nhận xoá dữ liệu</AlertDialogTitle>
                </AlertDialogHeader>
                <Separator />
                <div className="text-sm">
                    <div className="flex gap-x-8">
                        <div>Mã hàng hoá:</div>
                        <div>{product?.code}</div>
                    </div>
                    <div className="flex gap-x-8 my-2">
                        <div>Tên:</div>
                        <div>{product?.name}</div>
                    </div>
                </div>
                <Separator />
                <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => mutateAsync(product.id)} className="bg-red-600 text-white hover:bg-red-500">Đồng ý</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDeleteProduct;