import ConfirmDeleteVendor from "@/components/modal/vendor/delete"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IVendorResponse } from "@/types/vendor"
import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"


export type IVendorExtends = IVendorResponse & { refetch: () => void }  

export const VendorColumns: ColumnDef<IVendorExtends>[] = [
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
        id: 'Mã vendor',
        accessorKey: 'maNhaCungCap',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã vendor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.maNhaCungCap}</div>

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
        id: 'Tên vendor',
        accessorKey: 'tenNhaCungCap',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tên vendor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.tenNhaCungCap}</div>,
    },
    {
        id: 'Quốc gia',
        accessorKey: 'tenNhaCungCap',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Quốc gia
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.quocGia}</div>,
    },
    {
        id: 'Tiền tệ',
        accessorKey: 'tenNhaCungCap',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tiền tệ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.ngoaiTe}</div>,
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
                        <Link to="/vendor/$vendorId" params={{ vendorId: item.maNhaCungCap }}>
                            <DropdownMenuItem className="text-blue-600">
                                Cập nhật
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem asChild className="text-red-600">
                            <ConfirmDeleteVendor vendor={item} refetch={item?.refetch} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]