import { Checkbox } from "@/components/ui/checkbox"
import { numberWithCommas } from "@/lib/other"
import { IOrderResponse } from "@/types/order"
import { ColumnDef } from "@tanstack/react-table"


export const OrderPurchaseColumns: ColumnDef<IOrderResponse>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={row.getToggleSelectedHandler()}
                aria-label="Select row"
            />
        ),
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'No.',
        header: 'No.',
        accessorKey: 'stt',
        enableColumnFilter: false,
        cell: (a) => {
            const numb = (a.row.index + 1)
            return <div className="text-xs">{numb}</div>
        }

    },
    {
        id: 'PO',
        accessorKey: "soHopDong",
        accessorFn: (row) => row.orderNumber,
        header: 'PO',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.orderNumber}</div>,
    },
    {
        id: 'Khách hàng',
        accessorKey: 'maKhachHang',
        accessorFn: (row) => row.customerName,
        header: 'Khách hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.customerName}</div>,
    },
    {
        id: 'Mã hàng',
        accessorKey: 'cust_maHangHoa',
        header: 'Mã hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.productCodeSuggest ?? row.original?.productCodeSuggest}</div>,
    },
    {
        id: 'Tên hàng',
        accessorKey: 'cust_tenHangHoa',
        header: 'Tên hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.productNameSuggest ?? row.original?.productNameSuggest}</div>,
    },
    {
        id: 'Nhà cung cấp',
        accessorKey: 'cust_vendorCode',
        header: 'Nhà cung cấp',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.cust_vendorCode ?? row.original?.NhaCungCap?.maNhaCungCap}</div>,
    },
    {
        id: 'SL',
        accessorKey: "soLuong",
        header: 'SL',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soLuong}</div>,
    },
    {
        id: 'Đơn giá',
        accessorKey: "donGia",
        header: 'Đơn giá',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.unitPrice))}</div>,
    },
]