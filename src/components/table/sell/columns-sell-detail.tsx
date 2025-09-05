import SellDetailUpdate from "@/components/modal/sell/sell-detail-update"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { numberWithCommas } from "@/lib/other"
import { ISellDetailInput } from "@/types/sell"
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"



type ISellDetailExtends = ISellDetailInput & {
    deleteRow: () => void
    updateRow: (val: ISellDetailInput) => void
}

export const SellDetailColumns: ColumnDef<ISellDetailExtends>[] = [
    {
        id: 'No.',
        header: 'No.',
        accessorKey: 'stt',
        enableColumnFilter: false,
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs">{numb}</div>
        }

    },
    {
        id: 'cust_maHangHoa',
        accessorKey: 'cust_maHangHoa',
        cell: ({ row }) => <div className="text-xs">{row.original?.cust_maHangHoa}</div>,
        header: 'Mã hàng',
        filterFn:'includesString',
        enableColumnFilter: true,

    },
    {
        id: 'cust_tenHangHoa',
        accessorKey: 'cust_tenHangHoa',
        header: 'Tên hàng',
        cell: ({ row }) => <div className="text-xs">{row.original?.cust_tenHangHoa}</div>,
        filterFn:'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'cust_vendorCode',
        header: 'Nhà cung cấp',
        accessorKey: "cust_vendorCode",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.cust_vendorCode}</div>,
        filterFn: 'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'Số lượng',
        accessorKey: 'soLuong',
        header: 'Số lượng',
        cell: ({ row }) => <div className="text-xs">{row.original.soLuong}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn vị',
        accessorKey: 'donViTinh',
        header: 'Đơn vị',
        cell: ({ row }) => <div className="text-xs">{row.original?.donViTinh}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn giá',
        accessorKey: 'donGia',
        header: 'Đơn giá',
        cell: ({ row }) => {

            return <div className="text-xs">{numberWithCommas(Number(row.original.donGia))}</div>
        },
        enableColumnFilter: false,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'thanhTien',
        header: 'Thành tiền',
        cell: ({ row }) => <div className="text-xs">{numberWithCommas(Number(row.original.thanhTien))}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'actions',
        header: '',
        enableColumnFilter: false,
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
                        <DropdownMenuItem asChild className="text-blue-600">
                            <SellDetailUpdate saveDetail={item.updateRow} data={item} />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={item.deleteRow}>Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]