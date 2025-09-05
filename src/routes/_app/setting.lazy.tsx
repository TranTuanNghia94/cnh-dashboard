import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLogoutMutation } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useChangePassword, useGetMe } from '@/hooks/use-user';
import { LIST_ROLES } from '@/lib/constants';
import { createLazyFileRoute } from '@tanstack/react-router'
import moment from 'moment';
import React, { Fragment, useEffect } from 'react';

export const Route = createLazyFileRoute('/_app/setting')({
  component: SettingPage
})

function SettingPage() {
  const { mutate: getMe, data } = useGetMe()
  const { mutate: changePassword, isSuccess } = useChangePassword()
  const { mutate: logout } = useLogoutMutation()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    getMe()
  }, [])

  useEffect(() => {
    if (isSuccess) {
      toast({
        variant: "default",
        title: "Cập nhật thành công",
        description: "Đổi mật khẩu thành công",
      })

      setTimeout(() => {
        logout()
        window.location.reload()
      }, 4000)
    }
  }, [isSuccess])



  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const oldPwd = data.get('prevPassword')?.toString().trim() as string
    const newPwd = data.get('newPassword')?.toString().trim() as string
    const confirmPwd = data.get('confirmPassword')?.toString().trim() as string

    if (newPwd !== confirmPwd) {
      setError('Mật khẩu không khớp, vui lòng nhập lại')
    } else {
      setError(null)
      changePassword({ oldPwd, newPwd })
    }
  }


  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="uppercase">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 text-sm">
              <div>Họ:</div>
              <div>{data?.results ? data.results[0]?.firstname : ""}</div>
            </div>

            <div className="grid grid-cols-5 text-sm my-4">
              <div>Tên:</div>
              <div>{data?.results ? data.results[0]?.lastname : ""}</div>
            </div>

            <div className="grid grid-cols-5 text-sm my-4">
              <div>Email:</div>
              <div>{data?.results ? data.results[0]?.email : ""}</div>
            </div>


            <div className="grid grid-cols-5 text-sm my-4">
              <div>Ngày tạo:</div>
              <div>{data?.results ? moment(data.results[0]?.createdAt).format('DD/MM/YYYY') : ""}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="uppercase">Thông tin quyền hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-y-4 text-sm">
              {
                data?.results ? data.results[0]?.roles?.map((val: string) => <Fragment key={val}>
                  <div>{val}</div>
                  <div className="col-span-3">{LIST_ROLES[val as keyof typeof LIST_ROLES]?.name as string}</div>
                </Fragment>) : ""
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="uppercase">Quản lý tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <Label className="text-sm">Email</Label>
            <Input readOnly value={data?.results ? data.results[0]?.email : ""} disabled />
          </div>

          <div className=" mt-12 text-right">
            <span className={showPassword ? 'text-primary' : 'text-gray-600'}>Đổi mật khẩu</span> <Switch className="mx-2" checked={showPassword} onCheckedChange={setShowPassword} />
          </div>


          <form className='mt-4' onSubmit={onSubmit}>
            <div className="grid grid-cols-3">
              <Label className={!showPassword ? 'text-muted' : 'text-sm'}>Mật khẩu cũ</Label>
              <Input name="prevPassword" required maxLength={100} disabled={!showPassword} type="password" className="col-span-2" />
            </div>


            <div className="grid grid-cols-3 my-4">
              <Label className={!showPassword ? 'text-muted' : 'text-sm'}>Mật khẩu mới</Label>
              <Input name="newPassword" required maxLength={100} disabled={!showPassword} type="password" className="col-span-2" />
            </div>

            <div className="grid grid-cols-3">
              <Label className={!showPassword ? 'text-muted' : 'text-sm'}>Xác nhận mật khẩu mới</Label>
              <Input name="confirmPassword" required maxLength={100} disabled={!showPassword} type="password" className="col-span-2" />
            </div>

            <div className="text-red-500 my-2 text-sm text-center">{error}</div>

            <div className="text-center">
              <Button type="submit" size="sm" className="mt-4" disabled={!showPassword}>Cập nhật</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}