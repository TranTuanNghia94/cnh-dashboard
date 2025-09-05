import { Checkbox } from "@/components/ui/checkbox"
import { numberWithCommas } from "@/lib/other"
import { ISellDetailResponse } from "@/types/sell"
import { ColumnDef } from "@tanstack/react-table"


export const SellPurchaseColumns: ColumnDef<ISellDetailResponse>[] = [
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
        accessorFn: (row) => row.DonHang?.soHopDong,
        header: 'PO',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.DonHang?.soHopDong}</div>,
    },
    {
        id: 'Khách hàng',
        accessorKey: 'maKhachHang',
        accessorFn: (row) => row.DonHang?.KhachHang?.maKhachHang,
        header: 'Khách hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.DonHang?.KhachHang?.maKhachHang}</div>,
    },
    {
        id: 'Mã hàng',
        accessorKey: 'cust_maHangHoa',
        header: 'Mã hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.cust_maHangHoa ?? row.original?.HangHoa?.maHangHoa}</div>,
    },
    {
        id: 'Tên hàng',
        accessorKey: 'cust_tenHangHoa',
        header: 'Tên hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.cust_tenHangHoa ?? row.original?.HangHoa?.tenHang}</div>,
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
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.donGia))}</div>,
    },
]