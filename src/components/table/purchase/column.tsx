import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SELL_STATUS } from "@/lib/constants"
import { numberWithCommas } from "@/lib/other"
import { ISellResponse } from "@/types/sell"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import moment from "moment"
import { Link } from "@tanstack/react-router"

export const PurchasesColumns: ColumnDef<ISellResponse>[] = [
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
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs">{numb}</div>
        }

    },
    {
        id: 'Người tạo',
        accessorKey: 'ten',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Người tạo
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.CreatedBy?.fullname}</div>

    },
    {
        id: 'Số hợp đồng',
        accessorKey: "maHangHoa",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Số hợp đồng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.soHopDong}</div>,
    },
    {
        id: 'Mã đơn hàng',
        accessorKey: 'tenHang',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã đơn hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.orderNumber}</div>,
    },
    {
        id: 'Khách hàng',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Khách hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.KhachHang?.maKhachHang}</div>,
    },
    {
        id: 'Ngày PO',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ngày PO
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.ngayTao && moment(row.original?.ngayTao).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Ngày hoàn thành',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ngày hoàn thành
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.hanThanhToan && moment(row.original?.hanThanhToan).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Thành tiền
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{numberWithCommas(Number(row.original.thanhTien))}</div>,
    },
    {
        id: 'Ghi chú',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ghi chú
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.ghiChu}</div>,
    },
    {
        id: 'Trạng thái',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Trạng thái
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.original.i_status

            return (
                <div className="text-xs">
                    {status ? SELL_STATUS[status as keyof typeof SELL_STATUS] : SELL_STATUS.Nháp}
                </div>
            )
        }
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
                        <Link to="/purchase/$sellId" params={{ sellId: item.orderNumber as string }}>
                            <DropdownMenuItem >
                                Mua hàng
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]