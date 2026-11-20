import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useDeleteVendor } from '@/hooks/use-vendor'
import { IVendorResponse } from '@/types/vendor'
import { useEffect } from 'react'

type Props = {
  vendor: IVendorResponse
  refetch: () => void
}

const ConfirmDeleteVendor = ({ vendor, refetch }: Props) => {
  const { mutateAsync, isSuccess, data } = useDeleteVendor()
  const { toast } = useToast()

  useEffect(() => {
    if (isSuccess && data) {
      toast({
        title: 'Thao tác thành công',
        description: 'Đã xoá nhà cung cấp',
        variant: 'success',
      })
      refetch()
    }
  }, [isSuccess, data, refetch, toast])

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
            <div>Mã nhà cung cấp:</div>
            <div>{vendor?.code}</div>
          </div>
          <div className="flex gap-x-8 my-2">
            <div>Tên nhà cung cấp</div>
            <div>{vendor?.name}</div>
          </div>
          <div className="flex gap-x-8 my-2">
            <div>Tiền tệ</div>
            <div>{vendor?.currency}</div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutateAsync(vendor.id)} className="bg-red-600 text-white hover:bg-red-500">Đồng ý</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDeleteVendor;
