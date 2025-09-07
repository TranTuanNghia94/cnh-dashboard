import { Button } from "@/components/ui/button"
import { IGoodsResponse } from "@/types/goods"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"


export const ModalGoodsColumns: ColumnDef<IGoodsResponse>[] = [
    {
        id: 'Nhóm hàng',
        accessorKey: 'ten',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nhóm hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.LoaiHang?.ten}</div>

    },
    {
        id: 'Mã hàng',
        accessorKey: "maHangHoa",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.maHangHoa}</div>,
    },
    {
        id: 'Tên hàng',
        accessorKey: 'tenHang',
        header: 'Tên hàng',
        cell: ({ row }) => <div className="text-xs">{row.original.tenHang}</div>,
    },
]