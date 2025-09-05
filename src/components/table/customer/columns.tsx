import ConfirmDeleteCustomer from "@/components/modal/customer/delete";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ICustomerResponse } from "@/types/customer";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react";


export type ICustomerExtends = ICustomerResponse & { refetch: () => void }

export const CustomerColumns: ColumnDef<ICustomerExtends>[] = [
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
        id: 'Mã khách hàng',
        accessorKey: 'maKhachHang',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã khách hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.maKhachHang}</div>

    },
    {
        id: 'Mã MISA',
        accessorKey: "misaCode",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã MISA
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.misaCode}</div>,
    },
    {
        id: 'Tên khách hàng',
        accessorKey: 'tenKhachHang',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tên khách hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.tenKhachHang}</div>,
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
                        <Link to="/customer/$customerId" params={{ customerId: item.maKhachHang as string }}>
                            <DropdownMenuItem className="text-blue-600">Câp nhật</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem asChild className="text-red-600">
                            <ConfirmDeleteCustomer customer={item} refetch={item?.refetch} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]