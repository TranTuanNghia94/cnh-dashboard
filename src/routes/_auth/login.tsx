import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginMutation } from '@/hooks/use-auth'
import { usePasskeyLoginMutation } from '@/hooks/use-passkey'
import { toast } from '@/hooks/use-toast'
import { getCookie, TOKEN } from '@/lib/cookie'
import { getWebAuthnUnsupportedMessage, isWebAuthnSupported } from '@/lib/passkey'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1611373410761-41250e09875c?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
const MIN_PASSWORD_LENGTH = 3
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    const token = getCookie(TOKEN)
    if (token && token.length > 0) {
      throw redirect({ to: '/home', replace: true })
    }
  },
  component: LoginPage,
})

export function LoginPage() {
  const { mutate: login, isPending: isPasswordLoginPending } = useLoginMutation()
  const { mutate: loginWithPasskey, isPending: isPasskeyLoginPending } = usePasskeyLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')

  const isPending = isPasswordLoginPending || isPasskeyLoginPending
  const webAuthnSupported = isWebAuthnSupported()

  const validateEmail = (email: string) => EMAIL_REGEX.test(email)

  const validatePassword = (password: string) => password.length >= MIN_PASSWORD_LENGTH

  const showWarning = (message: string) => {
    toast({
      variant: 'warning',
      title: 'Cảnh báo',
      description: message,
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!validateEmail(email)) {
      showWarning('Email không đúng định dạng')
      return
    }

    if (!validatePassword(password)) {
      showWarning('Mật khẩu phải nhiều hơn 3 ký tự')
      return
    }

    setIdentifier(email)
    login({ email, password })
  }

  const handlePasskeyLogin = () => {
    if (!webAuthnSupported) {
      showWarning(getWebAuthnUnsupportedMessage())
      return
    }

    loginWithPasskey(identifier.trim() || undefined)
  }

  const inputClassName = 'h-11 bg-background/80 border-muted-foreground/20 shadow-sm'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 p-4 text-foreground">
      <div className="absolute inset-0 z-0">
        <img src={BACKGROUND_IMAGE} alt="" className="h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-primary/15" />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl dark:bg-background/95 lg:grid-cols-[1fr_0.9fr]">
          <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden border-r bg-white/75 p-10 text-foreground lg:flex">
            <div className="absolute inset-0">
              <img src={BACKGROUND_IMAGE} alt="" className="h-full w-full object-cover opacity-15" />
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/95 to-primary/20" />
            </div>

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur">
                <Sparkles className="h-4 w-4" />
                CNH Dashboard
              </div>

              <div className="space-y-4">
                <h1 className="max-w-md text-4xl font-bold tracking-tight text-slate-900">
                  Quản lý vận hành nhanh hơn, an toàn hơn.
                </h1>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Đăng nhập để theo dõi đơn hàng, tồn kho, thanh toán và bảo mật tài khoản bằng
                  passkey.
                </p>
              </div>
            </div>

            <div className="relative grid gap-3">
              <FeatureItem icon={<ShieldCheck className="h-5 w-5" />} title="Bảo mật bằng passkey" />
              <FeatureItem icon={<LockKeyhole className="h-5 w-5" />} title="JWT phiên đăng nhập an toàn" />
              <FeatureItem icon={<KeyRound className="h-5 w-5" />} title="Hỗ trợ Face ID, vân tay hoặc khóa bảo mật" />
            </div>
          </section>

          <section className="bg-white/80 p-6 sm:p-10 dark:bg-background/80">
            <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-8">
              <div className="text-center lg:text-left">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15 lg:mx-0">
                  <LockKeyhole className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sử dụng mật khẩu hoặc passkey để truy cập hệ thống.
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-background">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full justify-center border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                  onClick={handlePasskeyLogin}
                  disabled={isPending || !webAuthnSupported}
                >
                  {isPasskeyLoginPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xác thực passkey...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Đăng nhập bằng passkey
                    </>
                  )}
                </Button>

                {!webAuthnSupported ? (
                  <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
                    Passkey cần HTTPS (hoặc localhost) và trình duyệt hỗ trợ WebAuthn.
                  </p>
                ) : null}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-muted-foreground dark:bg-background">Hoặc đăng nhập bằng mật khẩu</span>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    className={inputClassName}
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      className={`${inputClassName} pr-10`}
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isPending}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full shadow-lg shadow-primary/20" disabled={isPending}>
                  {isPasswordLoginPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                Dữ liệu Face ID, vân tay hoặc mã PIN không được gửi lên server.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

type FeatureItemProps = {
  icon: React.ReactNode
  title: string
}

function FeatureItem({ icon, title }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/70 p-4 text-sm shadow-sm backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="font-medium text-slate-700">{title}</span>
    </div>
  )
}
