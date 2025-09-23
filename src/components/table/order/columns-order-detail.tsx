import SellDetailUpdate from "@/components/modal/sell/sell-detail-update"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { numberWithCommas } from "@/lib/other"
import { IOrderLineCreateRequest } from "@/types/order"
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"



type ISellDetailExtends = IOrderLineCreateRequest & {
    deleteRow: () => void
    updateRow: (val: IOrderLineCreateRequest) => void
}

export const OrderDetailColumns: ColumnDef<ISellDetailExtends>[] = [
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
        cell: ({ row }) => <div className="text-xs">{row.original?.productCodeSuggest}</div>,
        header: 'Mã hàng',
        filterFn:'includesString',
        enableColumnFilter: true,

    },
    {
        id: 'cust_tenHangHoa',
        accessorKey: 'cust_tenHangHoa',
        header: 'Tên hàng',
        cell: ({ row }) => <div className="text-xs">{row.original?.productNameSuggest}</div>,
        filterFn:'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'cust_vendorCode',
        header: 'Nhà cung cấp',
        accessorKey: "cust_vendorCode",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.vendorCodeSuggest}</div>,
        filterFn: 'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'Số lượng',
        accessorKey: 'soLuong',
        header: 'Số lượng',
        cell: ({ row }) => <div className="text-xs">{row.original.quantity}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn vị',
        accessorKey: 'donViTinh',
        header: 'Đơn vị',
        cell: ({ row }) => <div className="text-xs">{row.original?.uom}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn giá',
        accessorKey: 'donGia',
        header: 'Đơn giá',
        cell: ({ row }) => {

            return <div className="text-xs">{numberWithCommas(Number(row.original.unitPrice))}</div>
        },
        enableColumnFilter: false,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'thanhTien',
        header: 'Thành tiền',
        cell: ({ row }) => <div className="text-xs">{numberWithCommas(Number(row.original.totalAmount))}</div>,
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