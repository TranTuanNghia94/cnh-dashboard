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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  useDeleteAllPasskeysMutation,
  useDeletePasskeyMutation,
  getPasskeyCredentialId,
  usePasskeyRegisterMutation,
  usePasskeysQuery,
} from '@/hooks/use-passkey'
import { Link } from '@tanstack/react-router'
import { getDefaultPasskeyDeviceName, isWebAuthnSupported } from '@/lib/passkey'
import type { IPasskeyCredential } from '@/types/passkey'
import { KeyRound, Loader2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import moment from 'moment'
import { useState } from 'react'

const formatPasskeyDate = (value?: string) => {
  if (!value) {
    return '—'
  }

  return moment(value).format('DD/MM/YYYY HH:mm')
}

export function PasskeyManagementCard() {
  const { data: passkeys = [], isLoading, isFetching, refetch } = usePasskeysQuery()
  const { mutate: registerPasskey, isPending: isRegistering } = usePasskeyRegisterMutation()
  const { mutate: deletePasskey, isPending: isDeleting } = useDeletePasskeyMutation()
  const { mutate: deleteAllPasskeys, isPending: isDeletingAll } = useDeleteAllPasskeysMutation()
  const [deviceName, setDeviceName] = useState(getDefaultPasskeyDeviceName())
  const [credentialToDelete, setCredentialToDelete] = useState<IPasskeyCredential | null>(null)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [isCheckingPasskeys, setIsCheckingPasskeys] = useState(false)
  const webAuthnSupported = isWebAuthnSupported()
  const isPasskeyLoginEnabled = passkeys.length > 0
  const isBusy = isRegistering || isDeleting || isDeletingAll || isLoading || isCheckingPasskeys
  const isToggleDisabled =
    isBusy || (!isPasskeyLoginEnabled && (!webAuthnSupported || deviceName.trim().length === 0))

  const handleRegister = () => {
    registerPasskey(deviceName)
  }

  const handleTogglePasskeyLogin = async (enabled: boolean) => {
    setIsCheckingPasskeys(true)

    try {
      const latestPasskeys = (await refetch()).data ?? []

      if (enabled) {
        if (latestPasskeys.length === 0) {
          handleRegister()
        }
        return
      }

      if (latestPasskeys.length > 0) {
        setShowDisableConfirm(true)
      }
    } finally {
      setIsCheckingPasskeys(false)
    }
  }

  const handleConfirmDelete = () => {
    if (!credentialToDelete) {
      return
    }

    deletePasskey(getPasskeyCredentialId(credentialToDelete), {
      onSettled: () => setCredentialToDelete(null),
    })
  }

  const handleConfirmDisablePasskeyLogin = async () => {
    setIsCheckingPasskeys(true)

    try {
      const latestPasskeys = (await refetch()).data ?? []

      deleteAllPasskeys(latestPasskeys.map(getPasskeyCredentialId), {
        onSettled: () => setShowDisableConfirm(false),
      })
    } finally {
      setIsCheckingPasskeys(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-muted/80 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Passkey
          </CardTitle>
          <CardDescription>
            Đăng ký passkey là tùy chọn bảo mật trong cài đặt tài khoản. Trình duyệt có thể hiển
            thị &quot;Dùng điện thoại hoặc khóa bảo mật&quot; và mã QR để xác thực bằng Face ID,
            vân tay hoặc mã PIN thiết bị.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">

          {!webAuthnSupported ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Passkey chỉ hoạt động trên HTTPS (hoặc localhost) và trình duyệt hỗ trợ WebAuthn.
            </p>
          ) : null}

          <div className="flex items-center justify-between rounded-xl border bg-gradient-to-r from-primary/10 to-background p-4 gap-4">
            <div className="space-y-1">
              <Label htmlFor="passkey-login-toggle" className="text-sm font-medium">
                Đăng nhập bằng passkey
              </Label>
              <p className="text-xs text-muted-foreground">
                {isPasskeyLoginEnabled
                  ? 'Đang bật. Bạn có thể dùng passkey để đăng nhập.'
                  : 'Đang tắt. Bật tùy chọn này để đăng ký passkey cho tài khoản.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isPasskeyLoginEnabled ? 'success' : 'secondary'}>
                {isPasskeyLoginEnabled ? 'Đang bật' : 'Đang tắt'}
              </Badge>
              <Switch
                id="passkey-login-toggle"
                checked={isPasskeyLoginEnabled}
                onCheckedChange={handleTogglePasskeyLogin}
                disabled={isToggleDisabled}
                aria-label="Bật hoặc tắt đăng nhập bằng passkey"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm">Tên thiết bị mới</Label>
            <Input
              value={deviceName}
              onChange={(event) => setDeviceName(event.target.value)}
              placeholder="Ví dụ: MacBook Pro"
              disabled={!webAuthnSupported || isRegistering}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleRegister}
              disabled={!webAuthnSupported || isRegistering || deviceName.trim().length === 0}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Thêm passkey'
              )}
            </Button>
            <Button type="button" size="sm" variant="outline" asChild>
              <Link to="/register-passkey">Trang đăng ký passkey</Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Thiết bị đã đăng ký</div>
              <div className="text-xs text-muted-foreground">{passkeys.length} passkey</div>
            </div>
            {isLoading ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Đang tải danh sách passkey...
              </div>
            ) : passkeys.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                Chưa có passkey nào được đăng ký. Bật công tắc hoặc bấm &quot;Thêm passkey&quot; để bắt đầu.
              </div>
            ) : (
              passkeys.map((passkey) => (
                <div
                  key={getPasskeyCredentialId(passkey) || `${passkey.deviceName}-${passkey.createdAt}`}
                  className="flex items-center justify-between rounded-xl border bg-background p-3 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{passkey.deviceName || 'Thiết bị không tên'}</div>
                      <div className="text-xs text-muted-foreground">
                        Tạo: {formatPasskeyDate(passkey.createdAt)}
                        {passkey.lastUsedAt ? ` • Dùng gần nhất: ${formatPasskeyDate(passkey.lastUsedAt)}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success">Hoạt động</Badge>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setCredentialToDelete(passkey)}
                      disabled={isDeleting || isDeletingAll || !getPasskeyCredentialId(passkey)}
                      aria-label={`Xóa passkey ${passkey.deviceName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(credentialToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCredentialToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa passkey &quot;{credentialToDelete?.deviceName}&quot;? Thiết bị này
              sẽ không thể dùng để đăng nhập nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa passkey'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tắt đăng nhập bằng passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa tất cả passkey đã đăng ký khỏi tài khoản. Bạn sẽ không thể dùng
              passkey để đăng nhập cho đến khi đăng ký lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAll}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisablePasskeyLogin} disabled={isDeletingAll}>
              {isDeletingAll ? 'Đang tắt...' : 'Tắt passkey'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
