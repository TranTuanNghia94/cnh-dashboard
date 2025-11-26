import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginMutation } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { getCookie, TOKEN } from '@/lib/cookie'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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
  const { mutate, isPending } = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)


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

    mutate({ email, password })
  }



  const inputClassName = 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600'
  const labelClassName = 'text-gray-900 dark:text-white'

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <img src={BACKGROUND_IMAGE} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-[500px]">
        <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-8">
          <div className="grid gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
          </div>

          <form className="grid gap-8" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email" className={labelClassName}>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className={inputClassName}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className={labelClassName}>
                  Mật khẩu
                </Label>
              </div>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
