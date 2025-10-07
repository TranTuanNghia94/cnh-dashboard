import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { numberWithCommas } from "@/lib/other"
import { IOrderLineCreateRequest } from "@/types/order"
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"
import OrderLineUpdate from "@/components/modal/order/order-line-update"



type IOrderLineExtends = IOrderLineCreateRequest & {
    deleteRow: () => void
    updateRow: (val: IOrderLineCreateRequest) => void
}

export const OrderLineColumns: ColumnDef<IOrderLineExtends>[] = [
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
        id: 'Mã hàng',
        accessorKey: 'productCodeSuggest',
        cell: ({ row }) => <div className="text-xs">{row.original?.productCodeSuggest}</div>,
        header: 'Mã hàng',
        filterFn:'includesString',
        enableColumnFilter: true,

    },
    {
        id: 'Tên hàng',
        accessorKey: 'productNameSuggest',
        header: 'Tên hàng',
        cell: ({ row }) => <div className="text-xs">{row.original?.productNameSuggest}</div>,
        filterFn:'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'Nhà cung cấp',
        header: 'Nhà cung cấp',
        accessorKey: "vendorCodeSuggest",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.vendorCodeSuggest}</div>,
        filterFn: 'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'Số lượng',
        accessorKey: 'quantity',
        header: 'Số lượng',
        cell: ({ row }) => <div className="text-xs">{row.original.quantity}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn vị',
        accessorKey: 'uom',
        header: 'Đơn vị',
        cell: ({ row }) => <div className="text-xs">{row.original?.uom}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn giá',
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => {

            return <div className="text-xs">{numberWithCommas(Number(row.original.unitPrice))}</div>
        },
        enableColumnFilter: false,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'totalAmount',
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
                            <OrderLineUpdate saveDetail={item.updateRow} data={item as IOrderLineCreateRequest} />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={item.deleteRow}>Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]