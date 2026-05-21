import { PasskeyManagementCard } from '@/components/auth/passkey-management-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogoutMutation } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useChangePassword, useGetMe, useUpdateMyProfile } from '@/hooks/use-user';
import { LIST_ROLES } from '@/lib/constants';
import { IRolesResponse } from '@/types';
import { Link, createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, Home, KeyRound, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import moment from 'moment';
import React, { useEffect } from 'react';

export const Route = createLazyFileRoute('/_app/setting')({
  component: SettingPage
})

function SettingPage() {
  const { history } = useRouter()
  const { mutate: getMe, data } = useGetMe()
  const { mutate: changePassword, isSuccess } = useChangePassword()
  const { mutate: updateMyProfile, isPending: isUpdatingProfile } = useUpdateMyProfile()
  const { mutate: logout } = useLogoutMutation()
  const { toast } = useToast()
  const user = data?.data

  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    getMe()
  }, [getMe])

  useEffect(() => {
    if (isSuccess) {
      toast({
        variant: "default",
        title: "Cập nhật thành công",
        description: "Đổi mật khẩu thành công",
      })

      setTimeout(() => {
        logout()
      }, 4000)
    }
  }, [isSuccess, logout, toast])



  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const oldPassword = data.get('prevPassword')?.toString().trim() as string
    const newPassword = data.get('newPassword')?.toString().trim() as string
    const confirmPwd = data.get('confirmPassword')?.toString().trim() as string

    if (newPassword !== confirmPwd) {
      setError('Mật khẩu không khớp, vui lòng nhập lại')
    } else {
      setError(null)
      changePassword({ oldPassword, newPassword })
    }
  }

  const onProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    updateMyProfile(
      {
        firstName: formData.get('firstName')?.toString().trim() ?? '',
        lastName: formData.get('lastName')?.toString().trim() ?? '',
        phone: formData.get('phone')?.toString().trim() ?? '',
      },
      {
        onSuccess: () => getMe(),
      }
    )
  }


  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Cài đặt tài khoản</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Hồ sơ và bảo mật</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quản lý thông tin cá nhân, mật khẩu và tùy chọn đăng nhập bằng passkey.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" size="sm" onClick={() => history.go(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button type="button" variant="secondary" size="sm" asChild>
              <Link to="/home">
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>
            </Button>
            <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:flex">
              <UserRound className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-background/80 p-1 shadow-sm md:w-fit">
          <TabsTrigger value="profile" className="gap-2 py-2">
            <UserRound className="h-4 w-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 py-2">
            <LockKeyhole className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="passkey" className="gap-2 py-2">
            <KeyRound className="h-4 w-4" />
            Passkey
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
            <Card className="overflow-hidden border-muted/80 shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>Thông tin cơ bản của tài khoản đang đăng nhập.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <InfoRow icon={<UserRound className="h-4 w-4" />} label="Họ và tên" value={user?.fullName} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email} />
                <InfoRow icon={<Phone className="h-4 w-4" />} label="SĐT" value={user?.phone} />
                <InfoRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Ngày tạo"
                  value={user?.createdAt ? moment(user.createdAt).format('DD/MM/YYYY') : undefined}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="overflow-hidden border-muted/80 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" />
                    Cập nhật hồ sơ
                  </CardTitle>
                  <CardDescription>Chỉ được cập nhật họ, tên và số điện thoại.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-4" onSubmit={onProfileSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Họ</Label>
                      <Input id="lastName" name="lastName" defaultValue={user?.lastName ?? ''} maxLength={100} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Tên</Label>
                      <Input id="firstName" name="firstName" defaultValue={user?.firstName ?? ''} maxLength={100} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" name="phone" defaultValue={user?.phone ?? ''} maxLength={30} />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-muted/80 shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Quyền hạn
                </CardTitle>
                <CardDescription>Vai trò và phạm vi truy cập được gán cho tài khoản.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {user?.roles?.length ? (
                    user.roles.map((val: IRolesResponse) => (
                      <Badge key={val.id} variant="secondary" className="px-3 py-1">
                        {LIST_ROLES[val.code as keyof typeof LIST_ROLES]?.name ?? val.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Chưa có quyền hạn.</span>
                  )}
                </div>
              </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <Card className="overflow-hidden border-muted/80 shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" />
                Bảo mật tài khoản
              </CardTitle>
              <CardDescription>Cập nhật email hiển thị và đổi mật khẩu khi cần.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-2 md:max-w-xl">
                <Label className="text-sm font-medium">Email</Label>
                <Input readOnly value={user?.email ?? ""} disabled className="bg-muted/50" />
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
                <div>
                  <div className="font-medium">Đổi mật khẩu</div>
                  <p className="text-xs text-muted-foreground">
                    Bật tùy chọn này để cập nhật mật khẩu đăng nhập.
                  </p>
                </div>
                <Switch checked={showPassword} onCheckedChange={setShowPassword} />
              </div>

              <form className="grid gap-4 md:max-w-2xl" onSubmit={onSubmit}>
                <div className="grid gap-2">
                  <Label className={!showPassword ? 'text-muted-foreground' : 'text-sm'}>Mật khẩu cũ</Label>
                  <Input name="prevPassword" required maxLength={100} disabled={!showPassword} type="password" />
                </div>

                <div className="grid gap-2">
                  <Label className={!showPassword ? 'text-muted-foreground' : 'text-sm'}>Mật khẩu mới</Label>
                  <Input name="newPassword" required maxLength={100} disabled={!showPassword} type="password" />
                </div>

                <div className="grid gap-2">
                  <Label className={!showPassword ? 'text-muted-foreground' : 'text-sm'}>Xác nhận mật khẩu mới</Label>
                  <Input name="confirmPassword" required maxLength={100} disabled={!showPassword} type="password" />
                </div>

                {error ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!showPassword}>Cập nhật mật khẩu</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passkey" className="mt-0">
          <PasskeyManagementCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

type InfoRowProps = {
  icon: React.ReactNode
  label: string
  value?: string | null
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value || 'Chưa cập nhật'}</div>
      </div>
    </div>
  )
}