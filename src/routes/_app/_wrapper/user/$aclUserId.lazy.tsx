import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useAssignRoleToUser,
  useGetAllRoles,
  useGetUserById,
  useUnassignRoleFromUser,
} from '@/hooks/use-user'
import { LIST_ROLES } from '@/lib/constants'
import { IRolesResponse } from '@/types/user'
import { createLazyFileRoute, Link, useParams, useRouter } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Search,
  Shield,
  UserRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/user/$aclUserId')({
  component: AclUserPage,
})

function AclUserPage() {
  const { aclUserId } = useParams({ strict: false })
  const { history } = useRouter()
  const { mutateAsync: getAllRoles, data: rolesResponse, isPending: isLoadingRoles } =
    useGetAllRoles()
  const { mutateAsync: getUserById, data: userResponse, isPending: isLoadingUser } =
    useGetUserById()
  const { mutateAsync: assignRole, isPending: isAssigning } = useAssignRoleToUser()
  const { mutateAsync: unassignRole, isPending: isUnassigning } = useUnassignRoleFromUser()

  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [roleSearch, setRoleSearch] = useState('')

  const user = userResponse?.data
  const roles = useMemo(() => rolesResponse?.data?.data ?? [], [rolesResponse])
  const currentRole = user?.roles?.[0]

  const getRoleLabel = useCallback((role: IRolesResponse) => {
    return LIST_ROLES[role.code as keyof typeof LIST_ROLES]?.name ?? role.name
  }, [])

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  )

  const filteredRoles = useMemo(() => {
    const keyword = roleSearch.trim().toLowerCase()
    if (!keyword) return roles

    return roles.filter((role) => {
      const label = getRoleLabel(role).toLowerCase()
      return (
        label.includes(keyword) ||
        role.code.toLowerCase().includes(keyword) ||
        role.description?.toLowerCase().includes(keyword)
      )
    })
  }, [getRoleLabel, roles, roleSearch])

  const isSaving = isAssigning || isUnassigning

  const hasChanges = useMemo(() => {
    if (!currentRole?.id && !selectedRoleId) return false
    return selectedRoleId !== (currentRole?.id ?? '')
  }, [currentRole?.id, selectedRoleId])

  useEffect(() => {
    if (!aclUserId) return
    getUserById(aclUserId)
    getAllRoles()
  }, [aclUserId, getUserById, getAllRoles])

  useEffect(() => {
    if (currentRole?.id) {
      setSelectedRoleId(currentRole.id)
    }
  }, [currentRole?.id])

  const onSave = async () => {
    if (!aclUserId || !selectedRoleId) return

    await assignRole({ userId: aclUserId, roleId: selectedRoleId })
    await getUserById(aclUserId)
    history.go(-1)
  }

  const onClearRole = async () => {
    if (!aclUserId || !currentRole?.id) return

    await unassignRole({ userId: aclUserId, roleId: currentRole.id })
    setSelectedRoleId('')
    await getUserById(aclUserId)
    history.go(-1)
  }

  return (
    <div className="space-y-5">
      <HeaderPageLayout title="Gán vai trò người dùng" buttonSubmit={null} />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardContent className="p-5">
          {isLoadingUser ? (
            <p className="text-sm text-muted-foreground">Đang tải thông tin người dùng...</p>
          ) : (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <UserRound className="h-6 w-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium text-primary">Người dùng</div>
                  <h1 className="truncate text-xl font-bold tracking-tight">
                    {user?.fullName || user?.username}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{user?.username}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 px-4 py-3 lg:min-w-[240px]">
                <div className="text-xs text-muted-foreground">Vai trò hiện tại</div>
                {currentRole ? (
                  <>
                    <div className="mt-1 font-semibold">{getRoleLabel(currentRole)}</div>
                    <div className="text-xs text-muted-foreground">{currentRole.code}</div>
                  </>
                ) : (
                  <div className="mt-1 text-sm text-muted-foreground">Chưa gán vai trò</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Mỗi người dùng chỉ có <strong>một vai trò</strong>. Khi lưu, vai trò mới sẽ{' '}
          <strong>thay thế hoàn toàn</strong> vai trò hiện tại (không cộng dồn).
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="space-y-4 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-primary" />
                Chọn vai trò mới
              </CardTitle>
              <CardDescription className="mt-1">
                Chọn một vai trò trong danh sách bên dưới.
              </CardDescription>
            </div>
            {selectedRole ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Sẽ gán: </span>
                <span className="font-semibold">{getRoleLabel(selectedRole)}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({selectedRole.code})
                </span>
              </div>
            ) : null}
          </div>

          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Tìm vai trò theo tên hoặc mã..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoadingRoles ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Đang tải vai trò...
            </p>
          ) : filteredRoles.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {roles.length === 0
                ? 'Chưa có vai trò trong hệ thống.'
                : 'Không tìm thấy vai trò phù hợp.'}
            </p>
          ) : (
            <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <ScrollArea className="h-[min(520px,calc(100vh-420px))] pr-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredRoles.map((role) => {
                    const isSelected = selectedRoleId === role.id
                    const isCurrent = currentRole?.id === role.id

                    return (
                      <label
                        key={role.id}
                        htmlFor={`role-${role.id}`}
                        className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'bg-background hover:border-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        <RadioGroupItem
                          value={role.id}
                          id={`role-${role.id}`}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="truncate font-semibold">{getRoleLabel(role)}</div>
                            {isSelected ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            ) : null}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {role.code}
                          </div>
                          <div className="line-clamp-2 text-xs text-muted-foreground">
                            {role.description || 'Chưa có mô tả.'}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <Badge variant={isSelected ? 'default' : 'secondary'}>
                              {role.permissions?.length ?? 0} quyền
                            </Badge>
                            {isCurrent ? (
                              <Badge variant="outline">Đang dùng</Badge>
                            ) : null}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </ScrollArea>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      <Card className="sticky bottom-4 z-10 border-primary/20 shadow-md">
        <CardContent className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/user">Quay lại danh sách</Link>
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {currentRole ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onClearRole}
                disabled={isSaving}
              >
                Gỡ vai trò
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={!selectedRoleId || isSaving || !hasChanges}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu vai trò'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
