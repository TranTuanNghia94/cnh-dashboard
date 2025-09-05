import { Button } from "@/components/ui/button"
import { ICustomerAddressResponse } from "@/types/customer"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"


export const ModalAddressColumns: ColumnDef<ICustomerAddressResponse>[] = [
    {
        id: 'Người liên hệ',
        accessorKey: 'tenNguoiLienHe',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Người liên hệ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.tenNguoiLienHe}</div>

    },
    {
        id: 'SDT',
        accessorKey: "soDienThoai",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    SDT
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soDienThoai}</div>,
    },
    {
        id: 'Địa chỉ',
        accessorKey: "soNhaTenDuong_1",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Địa chỉ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soNhaTenDuong_1}</div>,
    },
]