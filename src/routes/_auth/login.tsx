import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginMutation } from '@/hooks/use-auth'
import { getCookie, USER } from '@/lib/cookie'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { useEffect } from 'react'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    const user = getCookie(USER);

    if (user) {
      throw redirect({
        to: "/home",
        replace: true,
      });
    }
  },
  component: LoginPage,
})

export function LoginPage() {
  const { mutate, isError, data, isSuccess, error } = useLoginMutation();
  const navigate = useNavigate()

  useEffect(() => {
    if (isSuccess && data?.data) {
      navigate({ to: '/home', replace: true })
    }
  }, [navigate, isSuccess, data])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 3
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    if (!validateEmail(email)) {
      alert('Email không đúng định dạng')
      return
    }

    if (!validatePassword(password)) {
      alert('Mật khẩu phải nhiều hơn 3 ký tự')
      return
    }

    mutate({
      email,
      password,
    })
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">ĐĂNG NHẬP</h1>
          </div>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                placeholder="Nhập mật khẩu"
                id="password"
                name="password"
                type="password"
                minLength={3}
                required
              />
            </div>

            {isError && <div className='text-red-500 text-center text-sm my-2'>{error?.message as unknown as string}</div>}

            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
      <div className='py-5'>
        <img
          src="https://images.unsplash.com/photo-1645460423995-1f00132e10ef?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="h-[90vh] w-[95%] object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
