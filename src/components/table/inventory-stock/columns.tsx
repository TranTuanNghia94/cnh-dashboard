import { Button } from "@/components/ui/button"
import { numberWithCommas } from "@/lib/other"
import { IInventoryStockResponse } from "@/types/inventory-stock"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"



export const InventoryStockColumns: ColumnDef<IInventoryStockResponse>[] = [
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
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.HangHoa?.maHangHoa?.toUpperCase()}</div>,
    },
    {
        id: 'Tên hàng',
        accessorKey: "tenHangHoa",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tên hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.HangHoa?.tenHang}</div>,
    },
    {
        id: 'Loại hàng',
        header: 'Loại hàng',
        accessorKey: "loaiHang",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.HangHoa?.LoaiHang?.ten?.toUpperCase()}</div>,
    },
    {
        id: 'Đơn vị',
        header: 'Đơn vị',
        accessorKey: "donViTinh",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.HangHoa?.donViTinh?.toUpperCase()}</div>,
    },
    {
        id: 'Tồn kho',
        header: 'Tồn kho',
        accessorKey: "tonKho",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soLuong}</div>,
    },
    {
        id: 'Đơn giá',
        header: 'Đơn giá',
        accessorKey: "donGia",
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Math.round(Number(row.original?.donGia)))}</div>,
    },
    {
        id: 'Kho',
        header: 'Kho',
        accessorKey: "kho",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.Kho?.maKho?.toUpperCase()}</div>,
    }
]