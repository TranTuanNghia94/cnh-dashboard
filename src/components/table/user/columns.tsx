import ConfirmActivateUser from "@/components/modal/user/activate";
import ConfirmDeleteRestoreUser from "@/components/modal/user/delete-restore";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { hasPermission, PERMISSION_CODES } from "@/lib/permissions";
import { IUserResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { useState } from "react";


type IUserExtends = IUserResponse & { refetch: () => void }


export const UserColumns: ColumnDef<IUserExtends>[] = [
    {
        id: 'stt',
        header: 'STT',
        accessorKey: 'stt',
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs">{numb}</div>
        }

    },
    {
        id: 'Họ & tên',
        accessorKey: 'fullname',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Họ & tên
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.fullName}</div>

    },
    {
        id: 'email',
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.getValue('email')}</div>,
    },
    {
        id: 'Chức vụ',
        accessorKey: 'roles',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Chức vụ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.original.roles.map((role) => role.description).join(', ')}</div>,
    },
    {
        id: 'status',
        header: 'Trạng thái',
        accessorKey: 'isActive',
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 text-xs">
                <Badge variant={row.original.isActive ? "success" : "destructive"}>
                    {row.original.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                </Badge>
                {row.original.isDeleted ? (
                    <Badge variant="destructive">Đã xoá</Badge>
                ) : null}
            </div>
        )
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => <UserRowActions item={row.original} />
    }
]

function UserRowActions({ item }: { item: IUserExtends }) {
    const [openStatus, setOpenStatus] = useState(false)
    const [openDeleteRestore, setOpenDeleteRestore] = useState(false)
    const isDeleted = Boolean(item.isDeleted)
    const canUpdate = hasPermission(PERMISSION_CODES.USER_UPDATE)
    const canActivate = hasPermission(PERMISSION_CODES.USER_ACTIVATE)
    const canDelete = hasPermission(PERMISSION_CODES.USER_DELETE)
    const canRestore = hasPermission(PERMISSION_CODES.USER_RESTORE)
    const hasAnyAction = canUpdate || canActivate || canDelete || canRestore

    if (!hasAnyAction) return null

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="bg-transparent">
                    <Button aria-haspopup="true" size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canUpdate && (
                        <Link to="/user/edit/$userId" params={{ userId: item.id as string }}>
                            <DropdownMenuItem className="text-blue-600">Cập nhật</DropdownMenuItem>
                        </Link>
                    )}
                    {canUpdate && (
                        <Link to="/user/$aclUserId" params={{ aclUserId: item.id as string }}>
                            <DropdownMenuItem className="text-blue-600">Gán quyền</DropdownMenuItem>
                        </Link>
                    )}
                    {!isDeleted && canActivate && (
                        <DropdownMenuItem
                            className={item.isActive ? 'text-red-600' : 'text-green-600'}
                            onSelect={() => setOpenStatus(true)}
                        >
                            {item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </DropdownMenuItem>
                    )}
                    {((!isDeleted && canDelete) || (isDeleted && canRestore)) && <DropdownMenuSeparator />}
                    {!isDeleted && canDelete && (
                        <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => setOpenDeleteRestore(true)}
                        >
                            Xoá
                        </DropdownMenuItem>
                    )}
                    {isDeleted && canRestore && (
                        <DropdownMenuItem
                            className="text-green-600"
                            onSelect={() => setOpenDeleteRestore(true)}
                        >
                            Khôi phục
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmActivateUser
                user={item}
                open={openStatus}
                onOpenChange={setOpenStatus}
                refetch={item.refetch}
            />
            <ConfirmDeleteRestoreUser
                user={item}
                open={openDeleteRestore}
                onOpenChange={setOpenDeleteRestore}
                refetch={item.refetch}
                mode={isDeleted ? 'restore' : 'delete'}
            />
        </>
    )
}
