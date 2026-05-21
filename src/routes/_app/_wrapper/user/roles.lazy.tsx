import HeaderPageLayout from '@/components/layout/HeaderPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  useAssignPermissionToRole,
  useCreateRole,
  useGetAllPermissions,
  useGetAllRoles,
  useUnassignPermissionFromRole,
} from '@/hooks/use-role'
import { useToast } from '@/hooks/use-toast'
import { LIST_ROLES } from '@/lib/constants'
import { IPermissionsResponse, IRolesResponse } from '@/types/user'
import { createLazyFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Plus, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/user/roles')({
  component: RoleAdminPage,
})

function RoleAdminPage() {
  const { toast } = useToast()
  const { mutateAsync: fetchRoles, data: rolesResponse, isPending: isLoadingRoles } =
    useGetAllRoles()
  const {
    mutateAsync: fetchPermissions,
    data: permissionsResponse,
    isPending: isLoadingPermissions,
  } = useGetAllPermissions()
  const { mutateAsync: createRole, isPending: isCreatingRole } = useCreateRole()
  const { mutateAsync: assignPermission, isPending: isAssigning } =
    useAssignPermissionToRole()
  const { mutateAsync: unassignPermission, isPending: isUnassigning } =
    useUnassignPermissionFromRole()

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [pendingPermissionIds, setPendingPermissionIds] = useState<Set<string>>(
    new Set(),
  )
  const [draftPermissionIds, setDraftPermissionIds] = useState<Set<string>>(
    new Set(),
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [roleSearch, setRoleSearch] = useState('')
  const [permissionSearch, setPermissionSearch] = useState('')
  const [selectedResource, setSelectedResource] = useState<string>('all')
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
  })

  const roles = useMemo(() => rolesResponse?.data?.data ?? [], [rolesResponse])
  const permissions = useMemo(
    () => permissionsResponse?.data?.data ?? [],
    [permissionsResponse],
  )

  const getRoleLabel = useCallback((role: IRolesResponse) => {
    return LIST_ROLES[role.code as keyof typeof LIST_ROLES]?.name ?? role.name
  }, [])

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  )

  const persistedPermissionIds = useMemo(() => {
    if (!selectedRole) return new Set<string>()

    const rolePermissionIds = new Set(
      selectedRole.permissions?.map((permission) => permission.id) ?? [],
    )
    const rolePermissionCodes = new Set(
      selectedRole.permissions?.map((permission) => permission.code) ?? [],
    )

    return new Set(
      permissions
        .filter(
          (permission) =>
            rolePermissionIds.has(permission.id) ||
            rolePermissionCodes.has(permission.code),
        )
        .map((permission) => permission.id),
    )
  }, [permissions, selectedRole])

  const assignedPermissionIds = draftPermissionIds

  const permissionsByResource = useMemo(() => {
    return permissions.reduce<Record<string, IPermissionsResponse[]>>((acc, permission) => {
      const resource = permission.resource || 'Khác'
      if (!acc[resource]) acc[resource] = []
      acc[resource].push(permission)
      return acc
    }, {})
  }, [permissions])

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

  const resourceStats = useMemo(() => {
    return Object.entries(permissionsByResource)
      .map(([resource, resourcePermissions]) => ({
        resource,
        total: resourcePermissions.length,
        assigned: resourcePermissions.filter((permission) =>
          draftPermissionIds.has(permission.id),
        ).length,
      }))
      .sort((a, b) => a.resource.localeCompare(b.resource))
  }, [draftPermissionIds, permissionsByResource])

  const visiblePermissionsByResource = useMemo(() => {
    const keyword = permissionSearch.trim().toLowerCase()

    return resourceStats.reduce<Record<string, IPermissionsResponse[]>>((acc, item) => {
      if (selectedResource !== 'all' && item.resource !== selectedResource) return acc

      const items = (permissionsByResource[item.resource] ?? [])
        .filter((permission) => {
          if (!keyword) return true
          return (
            permission.name.toLowerCase().includes(keyword) ||
            permission.code.toLowerCase().includes(keyword) ||
            permission.action.toLowerCase().includes(keyword) ||
            permission.description?.toLowerCase().includes(keyword)
          )
        })
        .sort((a, b) => a.code.localeCompare(b.code))

      if (items.length) acc[item.resource] = items
      return acc
    }, {})
  }, [permissionSearch, permissionsByResource, resourceStats, selectedResource])

  const loadData = useCallback(async () => {
    await Promise.all([fetchRoles(), fetchPermissions()])
  }, [fetchRoles, fetchPermissions])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id)
    }
  }, [roles, selectedRoleId])

  useEffect(() => {
    setDraftPermissionIds(new Set(persistedPermissionIds))
    setPendingPermissionIds(new Set())
  }, [persistedPermissionIds])

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault()

    const payload = {
      name: createForm.name.trim(),
      code: createForm.code.trim().toUpperCase(),
      description: createForm.description.trim(),
    }

    if (!payload.name || !payload.code) return

    const result = await createRole(payload)
    setCreateForm({ name: '', code: '', description: '' })
    setIsCreateOpen(false)
    await loadData()

    const createdId = result?.data?.id
    if (createdId) {
      setSelectedRoleId(createdId)
    }
  }

  const handlePermissionToggle = async (
    permission: IPermissionsResponse,
    checked: boolean,
  ) => {
    setDraftPermissionIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(permission.id)
      } else {
        next.delete(permission.id)
      }
      return next
    })
  }

  const handlePermissionBulkToggle = (
    permissionsToUpdate: IPermissionsResponse[],
    checked: boolean,
  ) => {
    setDraftPermissionIds((prev) => {
      const next = new Set(prev)
      permissionsToUpdate.forEach((permission) => {
        if (checked) {
          next.add(permission.id)
        } else {
          next.delete(permission.id)
        }
      })
      return next
    })
  }

  const handleSubmitPermissions = async () => {
    if (!selectedRole) return

    const permissionsToAssign = permissions.filter(
      (permission) =>
        draftPermissionIds.has(permission.id) && !persistedPermissionIds.has(permission.id),
    )
    const permissionsToUnassign = permissions.filter(
      (permission) =>
        persistedPermissionIds.has(permission.id) && !draftPermissionIds.has(permission.id),
    )
    const targetPermissions = [...permissionsToAssign, ...permissionsToUnassign]

    if (targetPermissions.length === 0) return

    setPendingPermissionIds(new Set(targetPermissions.map((permission) => permission.id)))

    try {
      await Promise.all(
        permissionsToAssign.map((permission) =>
          assignPermission({
            roleId: selectedRole.id,
            permissionId: permission.id,
          }),
        ),
      )
      await Promise.all(
        permissionsToUnassign.map((permission) =>
          unassignPermission({
            roleId: selectedRole.id,
            permissionId: permission.id,
          }),
        ),
      )
      await fetchRoles()
      toast({
        variant: 'success',
        title: 'Lưu quyền thành công',
        description: `Đã cập nhật ${targetPermissions.length} thay đổi cho vai trò ${getRoleLabel(selectedRole)}.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lưu quyền thất bại',
        description: getSubmitErrorMessage(error),
      })
    } finally {
      setPendingPermissionIds(new Set())
    }
  }

  const isPermissionBusy =
    isAssigning || isUnassigning || isLoadingRoles || isLoadingPermissions

  const totalAssignedPermissions = persistedPermissionIds.size
  const visibleResourceEntries = useMemo(
    () => Object.entries(visiblePermissionsByResource),
    [visiblePermissionsByResource],
  )
  const visiblePermissions = useMemo(
    () => visibleResourceEntries.flatMap(([, resourcePermissions]) => resourcePermissions),
    [visibleResourceEntries],
  )
  const visibleAssignedPermissionCount = visiblePermissions.filter((permission) =>
    assignedPermissionIds.has(permission.id),
  ).length
  const permissionChangeCount = useMemo(() => {
    const added = permissions.filter(
      (permission) =>
        draftPermissionIds.has(permission.id) && !persistedPermissionIds.has(permission.id),
    ).length
    const removed = permissions.filter(
      (permission) =>
        persistedPermissionIds.has(permission.id) && !draftPermissionIds.has(permission.id),
    ).length

    return added + removed
  }, [draftPermissionIds, permissions, persistedPermissionIds])

  return (
    <div className="space-y-5">
      <HeaderPageLayout title="Quản lý vai trò & quyền" buttonSubmit={null} />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Role admin
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Vai trò và quyền truy cập
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Tạo vai trò, chọn vai trò cần cấu hình, rồi bật/tắt quyền theo từng
                  nhóm nghiệp vụ. Danh mục quyền là dữ liệu hệ thống và chỉ dùng để gán.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
              <StatCard label="Vai trò" value={roles.length} />
              <StatCard label="Quyền" value={permissions.length} />
              <StatCard label="Đã gán" value={totalAssignedPermissions} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Card className="shadow-sm">
            <CardHeader className="space-y-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Vai trò</CardTitle>
                  <CardDescription>Chọn vai trò để cấu hình quyền.</CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="shrink-0">
                      <Plus className="h-4 w-4" />
                      Tạo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo vai trò mới</DialogTitle>
                      <DialogDescription>
                        Sau khi tạo, vai trò sẽ được chọn để bạn gán quyền ngay.
                      </DialogDescription>
                    </DialogHeader>
                    <form id="createRoleForm" className="space-y-4" onSubmit={handleCreateRole}>
                      <div className="grid gap-2">
                        <Label htmlFor="roleName">Tên vai trò</Label>
                        <Input
                          id="roleName"
                          value={createForm.name}
                          onChange={(e) =>
                            setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          maxLength={100}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="roleCode">Mã vai trò</Label>
                        <Input
                          id="roleCode"
                          value={createForm.code}
                          onChange={(e) =>
                            setCreateForm((prev) => ({ ...prev, code: e.target.value }))
                          }
                          placeholder="VD: WAREHOUSE_MANAGER"
                          maxLength={50}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="roleDescription">Mô tả</Label>
                        <Textarea
                          id="roleDescription"
                          value={createForm.description}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          maxLength={255}
                        />
                      </div>
                    </form>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Hủy
                        </Button>
                      </DialogClose>
                      <Button type="submit" form="createRoleForm" disabled={isCreatingRole}>
                        {isCreatingRole ? 'Đang tạo...' : 'Tạo vai trò'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc mã..."
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingRoles ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Đang tải vai trò...
                </p>
              ) : filteredRoles.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Không tìm thấy vai trò phù hợp.
                </p>
              ) : (
                <ScrollArea className="h-[calc(100vh-360px)] min-h-[360px] pr-3">
                  <div className="space-y-2">
                    {filteredRoles.map((role) => {
                      const isSelected = selectedRoleId === role.id

                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRoleId(role.id)}
                          className={`group w-full rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'bg-background hover:border-primary/40 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate font-semibold">{getRoleLabel(role)}</div>
                              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                {role.code}
                              </div>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            ) : null}
                          </div>
                          <div className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {role.description || 'Chưa có mô tả.'}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <Badge variant={isSelected ? 'default' : 'secondary'}>
                              {role.permissions?.length ?? 0} quyền
                            </Badge>
                            <span className="text-xs text-muted-foreground group-hover:text-primary">
                              Chọn
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Quyền của vai trò
                </CardTitle>
                <CardDescription className="mt-1">
                  Bật/tắt quyền để cập nhật ngay trên vai trò đang chọn.
                </CardDescription>
              </div>
              {selectedRole ? (
                <div className="rounded-xl border bg-muted/30 px-4 py-3 lg:min-w-[300px]">
                  <div className="text-xs text-muted-foreground">Đang cấu hình</div>
                  <div className="mt-1 font-semibold">{getRoleLabel(selectedRole)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{selectedRole.code}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={permissionChangeCount > 0 ? 'warning' : 'secondary'}>
                      {permissionChangeCount} thay đổi
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSubmitPermissions}
                      disabled={isPermissionBusy || permissionChangeCount === 0}
                    >
                      {isPermissionBusy ? 'Đang lưu...' : 'Lưu quyền'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            {!selectedRole ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Chọn một vai trò để quản lý quyền.
              </p>
            ) : isLoadingPermissions ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Đang tải quyền...
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    placeholder="Tìm quyền theo tên, mã, hành động..."
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedResource === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedResource('all')}
                  >
                    Tất cả
                    <Badge variant="secondary" className="ml-2">
                      {permissions.length}
                    </Badge>
                  </Button>
                  {resourceStats.map((item) => (
                    <Button
                      key={item.resource}
                      type="button"
                      size="sm"
                      variant={selectedResource === item.resource ? 'default' : 'outline'}
                      onClick={() => setSelectedResource(item.resource)}
                      className="gap-2"
                    >
                      {item.resource}
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">
                        {item.assigned}/{item.total}
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Đang hiển thị{' '}
                    <span className="font-medium text-foreground">
                      {visiblePermissions.length}
                    </span>{' '}
                    quyền, đã chọn{' '}
                    <span className="font-medium text-foreground">
                      {visibleAssignedPermissionCount}
                    </span>
                    .
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isPermissionBusy || visiblePermissions.length === 0}
                    onClick={() =>
                      handlePermissionBulkToggle(
                        visiblePermissions,
                        visibleAssignedPermissionCount !== visiblePermissions.length,
                      )
                    }
                  >
                    {visiblePermissions.length > 0 &&
                    visibleAssignedPermissionCount === visiblePermissions.length
                      ? 'Bỏ chọn tất cả đang hiển thị'
                      : 'Chọn tất cả đang hiển thị'}
                  </Button>
                </div>
              </>
            )}
          </CardHeader>

          {selectedRole && !isLoadingPermissions ? (
            <CardContent>
              {visibleResourceEntries.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy quyền phù hợp với bộ lọc hiện tại.
                </p>
              ) : (
                <div className="space-y-6">
                  {visibleResourceEntries
                  .map(([resource, resourcePermissions]) => (
                    <div key={resource}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold uppercase tracking-wide text-sm text-primary">
                            {resource}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {
                              resourcePermissions.filter((permission) =>
                                assignedPermissionIds.has(permission.id),
                              ).length
                            }
                            /{resourcePermissions.length} quyền đang bật
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isPermissionBusy}
                          onClick={() => {
                            const assignedCount = resourcePermissions.filter((permission) =>
                              assignedPermissionIds.has(permission.id),
                            ).length
                            handlePermissionBulkToggle(
                              resourcePermissions,
                              assignedCount !== resourcePermissions.length,
                            )
                          }}
                        >
                          {resourcePermissions.every((permission) =>
                            assignedPermissionIds.has(permission.id),
                          )
                            ? 'Bỏ chọn nhóm'
                            : 'Chọn cả nhóm'}
                        </Button>
                      </div>
                      <div className="grid gap-2 2xl:grid-cols-2">
                        {resourcePermissions.map((permission) => {
                            const isChecked = assignedPermissionIds.has(permission.id)
                            const isBusy = pendingPermissionIds.has(permission.id)

                            return (
                              <div
                                key={permission.id}
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                  !isPermissionBusy &&
                                  !isBusy &&
                                  handlePermissionToggle(permission, !isChecked)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    if (!isPermissionBusy && !isBusy) {
                                      handlePermissionToggle(permission, !isChecked)
                                    }
                                  }
                                }}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                                  isChecked
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'bg-background hover:bg-muted/40'
                                }`}
                              >
                                <Checkbox
                                  id={`perm-${permission.id}`}
                                  checked={isChecked}
                                  disabled={isPermissionBusy || isBusy}
                                  onClick={(event) => event.stopPropagation()}
                                  onCheckedChange={(value) =>
                                    handlePermissionToggle(permission, value === true)
                                  }
                                />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="text-sm font-medium">
                                    {permission.name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="font-mono">
                                      {permission.code}
                                    </Badge>
                                    <span>{permission.action}</span>
                                  </div>
                                  {permission.description ? (
                                    <div className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          ) : null}
        </Card>
      </div>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-background/80 p-3 text-center shadow-sm">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (error && typeof error === 'object') {
    const apiError = error as { error?: unknown; message?: unknown }
    if (typeof apiError.error === 'string') return apiError.error
    if (typeof apiError.message === 'string') return apiError.message
  }

  return 'Không thể cập nhật quyền cho vai trò. Vui lòng thử lại.'
}
