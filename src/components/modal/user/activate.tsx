import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
 // import { useDisableUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import { IUserResponse } from "@/types"
import { useEffect } from "react"


type Props = {
    user: IUserResponse
    refetch: () => void
}

const ConfirmActivateUser = ({ user, refetch }: Props) => {
 //   const { mutateAsync, isSuccess, data } = useDisableUser()
    // const { toast } = useToast()

    // useEffect(() => {
    //     if (isSuccess && data) {
    //         toast({
    //             title: 'Thao tác thành công',
    //             description: 'Cập nhật thành công',
    //             variant: 'success',
    //         })

    //         refetch()
    //     }
    // }, [isSuccess, data])


    return (
        <AlertDialog>
            {/* <AlertDialogTrigger asChild>
                <div className={cn("relative hover:text-white flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", !user?.disabledAt ? "text-red-600 hover:bg-red-500" : "text-green-600 hover:bg-green-500")}>
                    {user?.disabledAt ? "Mở khoá" : "Khoá"}
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận {user?.disabledAt ? "mở khoá" : "khoá"} người dùng</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm">
                    <div className="flex gap-x-8">
                        <div>Tên người dùng:</div>
                        <div>{user?.fullname}</div>
                    </div>
                    <div className="flex gap-x-8 my-2">
                        <div>Email</div>
                        <div>{user?.email}</div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => mutateAsync({username: user.username})} className="bg-red-600 text-white hover:bg-red-500">Đồng ý</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent> */}
        </AlertDialog>
    )
}

export default ConfirmActivateUser;