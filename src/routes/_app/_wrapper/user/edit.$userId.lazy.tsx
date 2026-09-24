import HeaderPageLayout from '@/components/layout/HeaderPage'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  useGetAllRoles,
  useGetUserById,
  useGetUsers,
  useResetUserPassword,
  useToggleUserActive,
  useUpdateUser,
} from '@/hooks/use-user'
import { EMAIL_REGEX, LIST_ROLES } from '@/lib/constants'
import { hasPermission, PERMISSION_CODES } from '@/lib/permissions'
import { IRolesResponse, IUserResponse } from '@/types/user'
import { createLazyFileRoute, Link, useParams } from '@tanstack/react-router'
import { Eye, EyeOff, KeyRound, Loader2, Mail, Shield, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const Route = createLazyFileRoute('/_app/_wrapper/user/edit/$userId')({
  component: UserEditPage,
})

function UserEditPage() {
  const { userId } = useParams({ strict: false })
  const { toast } = useToast()
  const { mutateAsync: getUserById, isPending: isLoadingById } = useGetUserById()
  const { mutateAsync: getUsers, isPending: isLoadingList } = useGetUsers()
  const { mutateAsync: getRoles, data: rolesResponse } = useGetAllRoles()
  const { mutateAsync: updateUser, isPending: isSaving } = useUpdateUser()
  const { mutateAsync: resetPassword, isPending: isResetting } = useResetUserPassword()
  const { mutateAsync: toggleActive, isPending: isToggling } = useToggleUserActive()

  const [user, setUser] = useState<IUserResponse>()
  const [notFound, setNotFound] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState(false)

  const canUpdate = hasPermission(PERMISSION_CODES.USER_UPDATE)
  const canReset = hasPermission(PERMISSION_CODES.USER_RESET_PASSWORD)
  const canActivate = hasPermission(PERMISSION_CODES.USER_ACTIVATE)

  const roles = useMemo(() => rolesResponse?.data?.data ?? [], [rolesResponse])

  const applyUser = useCallback((next: IUserResponse) => {
    setUser(next)
    setFirstName(next.firstName ?? '')
    setLastName(next.lastName ?? '')
    setEmail(next.email ?? '')
    setPhone(next.phone ?? '')
    setRoleId(next.roles?.[0]?.id ?? '')
  }, [])

  const loadUser = useCallback(async () => {
    if (!userId) return
    setNotFound(false)
    if (UUID_RE.test(userId)) {
      const response = await getUserById(userId)
      if (response?.data) applyUser(response.data)
      else setNotFound(true)
      return
    }

    const response = await getUsers({ page: 0, limit: 500 })
    const found = response?.data?.data?.find(
      (item) => item.username?.toLowerCase() === userId.toLowerCase(),
    )
    if (!found) {
      setNotFound(true)
      return
    }
    applyUser(found)
  }, [applyUser, getUserById, getUsers, userId])

  useEffect(() => {
    void loadUser()
    void getRoles()
  }, [loadUser, getRoles])

  const roleLabel = (role: IRolesResponse) =>
    LIST_ROLES[role.code as keyof typeof LIST_ROLES]?.name ?? role.description ?? role.name

  const onSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !canUpdate) return
    if (!firstName.trim()) {
      toast({ variant: 'warning', title: 'Thiếu tên', description: 'Nhập tên người dùng.' })
      return
    }
    if (!email.toLowerCase().includes(EMAIL_REGEX)) {
      toast({
        variant: 'warning',
        title: 'Email không hợp lệ',
        description: 'Email cần có đuôi @iesvietnam.com',
      })
      return
    }
    if (!roleId) {
      toast({ variant: 'warning', title: 'Thiếu chức vụ', description: 'Chọn một chức vụ trước khi lưu.' })
      return
    }

    const response = await updateUser({
      id: user.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: roleId,
    })
    if (response?.data) applyUser(response.data)
  }

  const onResetPassword = async () => {
    if (!user || !canReset) return
    if (newPassword.length < 6) {
      toast({ variant: 'warning', title: 'Mật khẩu quá ngắn', description: 'Mật khẩu cần ít nhất 6 ký tự.' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'warning', title: 'Mật khẩu không khớp', description: 'Nhập lại mật khẩu cho trùng.' })
      return
    }
    await resetPassword({ id: user.id, newPassword })
    setNewPassword('')
    setConfirmPassword('')
    setConfirmReset(false)
  }

  const onToggleActive = async () => {
    if (!user || !canActivate) return
    await toggleActive(user.id)
    toast({
      variant: 'success',
      title: user.isActive ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản',
    })
    setConfirmStatus(false)
    await loadUser()
  }

  const isLoading = isLoadingById || isLoadingList

  return (
    <div className="space-y-5">
      <HeaderPageLayout
        title="Cập nhật tài khoản"
        idForm={canUpdate ? 'formEditUser' : undefined}
        buttonSubmit={canUpdate ? undefined : null}
      />

      {isLoading && !user ? (
        <Card>
          <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải tài khoản...
          </CardContent>
        </Card>
      ) : notFound || !user ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Không tìm thấy tài khoản <span className="font-medium text-foreground">{userId}</span>.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <UserRound className="h-6 w-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium text-primary">Tài khoản</div>
                  <h1 className="truncate text-xl font-bold tracking-tight">
                    {`${lastName} ${firstName}`.trim() || user.fullName || user.username}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{user.username}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {email || user.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={user.isActive ? 'success' : 'destructive'}>
                  {user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                </Badge>
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link to="/user/$aclUserId" params={{ aclUserId: user.id }}>
                    <Shield className="mr-2 h-4 w-4" />
                    Gán quyền
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Thông tin tài khoản</CardTitle>
                <CardDescription>Họ tên, email, số điện thoại và chức vụ.</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="formEditUser" className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void onSaveProfile(event)}>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs">Họ</Label>
                    <Input id="lastName" value={lastName} maxLength={200} disabled={!canUpdate || isSaving} onChange={(event) => setLastName(event.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs">Tên <span className="text-red-600">*</span></Label>
                    <Input id="firstName" value={firstName} required maxLength={200} disabled={!canUpdate || isSaving} onChange={(event) => setFirstName(event.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs">Tên đăng nhập</Label>
                    <Input id="username" value={user.username} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs">Số điện thoại</Label>
                    <Input id="phone" value={phone} maxLength={30} disabled={!canUpdate || isSaving} onChange={(event) => setPhone(event.target.value)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="email" className="text-xs">Email <span className="text-red-600">*</span></Label>
                    <Input id="email" type="email" value={email} required maxLength={200} disabled={!canUpdate || isSaving} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Chức vụ <span className="text-red-600">*</span></Label>
                    <Select value={roleId || undefined} onValueChange={setRoleId} disabled={!canUpdate || isSaving}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chức vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {roleLabel(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Đặt lại mật khẩu
                  </CardTitle>
                  <CardDescription>Mật khẩu mới có hiệu lực ngay. Người dùng dùng mật khẩu này để đăng nhập.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs">Mật khẩu mới</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        minLength={6}
                        maxLength={200}
                        disabled={!canReset || isResetting}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => setShowPassword((value) => !value)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs">Xác nhận mật khẩu</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      minLength={6}
                      maxLength={200}
                      disabled={!canReset || isResetting}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canReset || isResetting || !newPassword || !confirmPassword}
                    onClick={() => setConfirmReset(true)}
                  >
                    {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Đặt lại mật khẩu
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái tài khoản</CardTitle>
                  <CardDescription>
                    {user.isActive
                      ? 'Tài khoản đang được phép đăng nhập.'
                      : 'Tài khoản đang bị khóa và không đăng nhập được.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    size="sm"
                    variant={user.isActive ? 'destructive' : 'default'}
                    disabled={!canActivate || isToggling}
                    onClick={() => setConfirmStatus(true)}
                  >
                    {isToggling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đặt lại mật khẩu?</AlertDialogTitle>
            <AlertDialogDescription>
              Mật khẩu của {user?.username} sẽ được thay bằng mật khẩu mới. Phiên đăng nhập hiện tại của họ không bị đăng xuất tự động.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction disabled={isResetting} onClick={(event) => { event.preventDefault(); void onResetPassword() }}>
              {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Đặt lại mật khẩu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmStatus} onOpenChange={setConfirmStatus}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{user?.isActive ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt tài khoản?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {user?.isActive
                ? `${user.fullName || user.username} sẽ không đăng nhập được cho đến khi được kích hoạt lại.`
                : `${user?.fullName || user?.username} sẽ đăng nhập được trở lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className={user?.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              disabled={isToggling}
              onClick={(event) => { event.preventDefault(); void onToggleActive() }}
            >
              {isToggling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {user?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
