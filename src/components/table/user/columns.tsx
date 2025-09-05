import ConfirmActivateUser from "@/components/modal/user/activate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LIST_ROLES } from "@/lib/constants";
import { IUserResponse } from "@/types";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react";

const getUserTitle = (val: IUserResponse) => {
    const roles = [
        LIST_ROLES.DIRECTOR,
        LIST_ROLES.ACCOUNTANT_MANAGER,
        LIST_ROLES.ACCOUNTANT,
        LIST_ROLES.CS_MANAGER,
        LIST_ROLES.CS,
        LIST_ROLES.ADMIN,
        LIST_ROLES.INVENTORY_AUDITOR
    ];

    // for (const role of roles) {
    //     if (val.Assignment?.Roles && val.Assignment?.Roles.some((r) => r.name === role.code)) {
    //         return role.name;
    //     }
    // }
}

type IUserExtends = IUserResponse & { refetch: () => void }


export const UserColumns: ColumnDef<IUserExtends>[] = [
    {
        id: 'No.',
        header: 'No.',
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
        // cell: ({ row }) => <div className="text-xs">{row.original.fullname}</div>

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
        accessorKey: 'role',
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
        // cell: ({ row }) => <div>{getUserTitle(row.original)}</div>,
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
       // cell: ({ row }) => <div className="text-xs"><Badge variant={!row.original.disabledAt ? "outline" : "destructive"}>{!row.original.disabledAt ? "active" : "inactive"}</Badge></div>
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const item = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="bg-transparent">
                        <Button
                            aria-haspopup="true"
                            size="sm"
                            variant="ghost"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Link to="/user/edit/$userId" params={{ userId: item.username as string }}>
                            <DropdownMenuItem className="text-blue-600">Cập nhật</DropdownMenuItem>
                        </Link>
                        <Link to="/user/$aclUserId" params={{ aclUserId: item.username as string }}>
                            <DropdownMenuItem className="text-blue-600">Gán quyền</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem asChild>
                            <ConfirmActivateUser user={item} refetch={item.refetch} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]