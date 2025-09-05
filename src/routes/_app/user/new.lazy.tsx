import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateUser } from '@/hooks/use-user'
import { EMAIL_REGEX } from '@/lib/constants'
import { IUserInput } from '@/types/user'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/user/new')({
  component: NewUserPage,
})

function NewUserPage() {
  const { toast } = useToast()
  const { mutateAsync, data, isSuccess } = useCreateUser()
  const { history } = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Thao tác thành công",
        description: "Tạo tài khoản thành công",
        variant: "success",
      })

      history.go(-1)
    }
  }, [isSuccess, data])

  const validatePassword = (password: string, rePassword: string): boolean => {
    if (password !== rePassword) {
      toast({
        title: "Thao tác thất bại",
        description: "Mật khẩu không khớp",
        variant: "warning",
      })
      return false
    }
    return true
  }

  const validateEmail = (email: string): boolean => {
    if (!email.includes(EMAIL_REGEX)) {
      toast({
        title: "Thao tác thất bại",
        description: "Email không hợp lệ, vui lòng nhập email có đuôi @iesvietnam.com",
        variant: "warning",
      })
      return false
    }
    return true
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const fields = [
      'lastname',
      'firstname',
      'email',
      'phongBan',
      'password',
    ]

    const formData = new FormData(e.currentTarget)

    const userData = fields.reduce(
      (acc, field) => {
        acc[field] = formData.get(field)?.toString().trim() as string
        return acc
      },
      {} as Record<string, string>,
    ) as unknown as IUserInput

    if (!validateEmail(userData.email)) {
      return
    }

    if (!validatePassword(formData.get("password")?.toString() as string, formData.get("re-password")?.toString() as string)) {
      return
    }

    await mutateAsync(userData)
  }

  return (
    <div>
      <HeaderPageLayout title='TẠO NGƯỜI DÙNG MỚI' idForm="formCreateUser" />

      <div className='mt-4'>
        <Card>
          <CardContent className="m-4">
            <form id="formCreateUser" className="grid grid-cols-1 gap-8" onSubmit={onSubmit}>
              <div>
                <Label className="text-xs" htmlFor="lastname">Họ</Label>
                <Input name="lastname" maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="firstname">Tên</Label>
                <Input name="firstname" required maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="phongBan">Phòng ban</Label>
                <Input name="phongBan" maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="email">Email <span className="text-red-600">*</span></Label>
                <Input type="email" name="email" maxLength={200} required className="col-span-2" />
              </div>


              <div>
                <Label className="text-xs" htmlFor="password">Mật khẩu mặt định <span className="text-red-600">*</span></Label>
                <div className="flex">
                  <Input type={showPassword ? "text" : "password"} name="password" minLength={6} maxLength={200} required className="col-span-2" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>


              <div>
                <Label className="text-xs" htmlFor="email">Xác nhận mật khẩu <span className="text-red-600">*</span></Label>
                <Input type="password" name="re-password" minLength={6} maxLength={200} required className="col-span-2" />
              </div>


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}