import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCreateUser, useGetAllRoles } from '@/hooks/use-user'
import { EMAIL_REGEX } from '@/lib/constants'
import { ICreateUserInput } from '@/types/user' 
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/_app/user/new')({
  component: NewUserPage,
})

function NewUserPage() {
  const { toast } = useToast()
  const { mutateAsync, data, isSuccess } = useCreateUser()

  const { data: roles, mutateAsync: getRoles } = useGetAllRoles()
  const { history } = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    getRoles()
  }, [])

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
      'lastName',
      'firstName',
      'email',
      'role',
      'password'
    ]

    const formData = new FormData(e.currentTarget)

    const userData = fields.reduce(
      (acc, field) => {
        acc[field] = formData.get(field)?.toString().trim() as string
        return acc
      },
      {} as Record<string, string>,
    ) as unknown as ICreateUserInput

    if (!validateEmail(userData.email)) {
      return
    }

    if (!validatePassword(userData.password, formData.get("rePassword")?.toString() as string)) {
      return
    }

    userData.fullName = `${userData.lastName} ${userData.firstName}`
    userData.username = userData.email.replace('@iesvietnam.com', '')

    console.log("userData", userData)

    await mutateAsync(userData)
  }

  return (
    <div>
      <HeaderPageLayout title='TẠO TÀI KHOẢN MỚI' idForm="formCreateUser" />

      <div className='mt-4'>
        <Card>
          <CardContent className="m-4">
            <form id="formCreateUser" className="grid grid-cols-1 gap-8" onSubmit={onSubmit}>
              <div>
                <Label className="text-xs" htmlFor="lastName">Họ</Label>
                <Input name="lastName" maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="firstName">Tên</Label>
                <Input name="firstName" required maxLength={200} className="col-span-2" />
              </div>

              <div>
                <Label className="text-xs" htmlFor="role">Chức vụ <span className="text-red-600">*</span></Label>
                <Select name="role" required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Chức vụ" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {roles?.data?.data?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Input type="password" name="rePassword" minLength={6} maxLength={200} required className="col-span-2" />
              </div>


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}