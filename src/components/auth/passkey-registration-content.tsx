import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePasskeyRegisterMutation } from '@/hooks/use-passkey'
import { getDefaultPasskeyDeviceName, isWebAuthnSupported } from '@/lib/passkey'
import { KeyRound, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type PasskeyRegistrationContentProps = {
  required?: boolean
  onCompleted: () => void
  onSkip?: () => void
}

export function PasskeyRegistrationContent({
  required = false,
  onCompleted,
  onSkip,
}: PasskeyRegistrationContentProps) {
  const { mutate: registerPasskey, isPending } = usePasskeyRegisterMutation()
  const [deviceName, setDeviceName] = useState(getDefaultPasskeyDeviceName())
  const webAuthnSupported = isWebAuthnSupported()

  useEffect(() => {
    setDeviceName(getDefaultPasskeyDeviceName())
  }, [])

  const handleRegister = () => {
    registerPasskey(deviceName, {
      onSuccess: () => {
        onCompleted()
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Đăng ký passkey</h1>
        <p className="text-sm text-muted-foreground">
          {required
            ? 'Tài khoản của bạn bắt buộc phải đăng ký passkey trước khi tiếp tục. Trình duyệt có thể hiển thị "Dùng điện thoại hoặc khóa bảo mật" và mã QR để xác thực bằng Face ID, vân tay hoặc mã PIN thiết bị.'
            : 'Đây là tùy chọn bảo mật trong cài đặt tài khoản. Trình duyệt có thể hiển thị "Dùng điện thoại hoặc khóa bảo mật" và mã QR để xác thực bằng Face ID, vân tay hoặc mã PIN thiết bị.'}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="passkey-device-name">Tên thiết bị</Label>
        <Input
          id="passkey-device-name"
          value={deviceName}
          onChange={(event) => setDeviceName(event.target.value)}
          placeholder="Ví dụ: iPhone của Nghia"
          disabled={isPending || !webAuthnSupported}
        />
      </div>

      {!webAuthnSupported ? (
        <p className="text-sm text-destructive text-center">
          Passkey chỉ hoạt động trên HTTPS (hoặc localhost) và trình duyệt hỗ trợ WebAuthn.
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {!required && onSkip ? (
          <Button type="button" variant="outline" onClick={onSkip} disabled={isPending}>
            Bỏ qua
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={handleRegister}
          disabled={isPending || !webAuthnSupported || deviceName.trim().length === 0}
          className={required ? 'w-full sm:w-auto' : undefined}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            'Đăng ký passkey'
          )}
        </Button>
      </div>

      {required && !webAuthnSupported ? (
        <p className="text-xs text-center text-muted-foreground">
          Liên hệ quản trị viên nếu thiết bị của bạn không hỗ trợ passkey.
        </p>
      ) : null}
    </div>
  )
}
