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
import { useDeleteUser, useRestoreUser } from '@/hooks/use-user'
import { IUserResponse } from '@/types'
import { Loader2 } from 'lucide-react'

type Props = {
  user: IUserResponse
  open: boolean
  onOpenChange: (open: boolean) => void
  refetch: () => void
  mode: 'delete' | 'restore'
}

const ConfirmDeleteRestoreUser = ({ user, open, onOpenChange, refetch, mode }: Props) => {
  const deleteMutation = useDeleteUser()
  const restoreMutation = useRestoreUser()
  const isPending = deleteMutation.isPending || restoreMutation.isPending
  const isRestore = mode === 'restore'

  const onConfirm = async () => {
    if (isRestore) {
      await restoreMutation.mutateAsync(user.id)
    } else {
      await deleteMutation.mutateAsync(user.id)
    }
    onOpenChange(false)
    refetch()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRestore ? 'Khôi phục tài khoản?' : 'Xoá tài khoản?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRestore
              ? `${user.fullName || user.username} sẽ được khôi phục và xuất hiện lại trong hệ thống.`
              : `${user.fullName || user.username} sẽ bị xoá mềm. Có thể khôi phục sau.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            className={isRestore ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isRestore ? 'Khôi phục' : 'Xoá'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDeleteRestoreUser
