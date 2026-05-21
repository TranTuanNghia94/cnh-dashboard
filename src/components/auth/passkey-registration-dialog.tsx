import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PasskeyRegistrationContent } from '@/components/auth/passkey-registration-content'

type PasskeyRegistrationDialogProps = {
  open: boolean
  required?: boolean
  onOpenChange: (open: boolean) => void
  onCompleted: () => void
}

export function PasskeyRegistrationDialog({
  open,
  required = false,
  onOpenChange,
  onCompleted,
}: PasskeyRegistrationDialogProps) {
  const handleCompleted = () => {
    onOpenChange(false)
    onCompleted()
  }

  const handleSkip = () => {
    onOpenChange(false)
    onCompleted()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (required && !nextOpen) {
          return
        }
        onOpenChange(nextOpen)
        if (!nextOpen) {
          onCompleted()
        }
      }}
    >
      <DialogContent
        onInteractOutside={required ? (event) => event.preventDefault() : undefined}
        onEscapeKeyDown={required ? (event) => event.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle>Đăng ký passkey</DialogTitle>
          <DialogDescription className="sr-only">
            Đăng ký passkey cho tài khoản của bạn
          </DialogDescription>
        </DialogHeader>

        <PasskeyRegistrationContent
          required={required}
          onCompleted={handleCompleted}
          onSkip={required ? undefined : handleSkip}
        />
      </DialogContent>
    </Dialog>
  )
}
