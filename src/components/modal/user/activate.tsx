import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useToggleUserActive } from '@/hooks/use-user'
import { IUserResponse } from '@/types'
import { Loader2 } from 'lucide-react'

type Props = {
  user: IUserResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  refetch: () => void
}

const ConfirmActivateUser = ({ user, open, onOpenChange, refetch }: Props) => {
  const { toast } = useToast()
  const { mutateAsync, isPending } = useToggleUserActive()
  const active = Boolean(user.isActive)

  const onConfirm = async () => {
    await mutateAsync(user.id)
    toast({
      variant: 'success',
      title: active ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản',
    })
    onOpenChange(false)
    refetch()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{active ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt tài khoản?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {active
              ? `${user.fullName || user.username} sẽ không đăng nhập được cho đến khi được kích hoạt lại.`
              : `${user.fullName || user.username} sẽ đăng nhập được trở lại.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            className={active ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmActivateUser
