import { Button } from "@/components/ui/button"
import { ICustomerResponse } from "@/types/customer"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"


export const ModalCustomerColumns: ColumnDef<ICustomerResponse>[] = [
    {
        id: 'Mã khách hàng',
        accessorKey: 'maKhachHang',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã khách hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.maKhachHang}</div>

    },
    {
        id: 'Tên khách hàng',
        accessorKey: "tenKhachHang",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tên khách hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.tenKhachHang}</div>,
    },
]