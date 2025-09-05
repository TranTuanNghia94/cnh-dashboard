import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { numberWithCommas } from "@/lib/other"
import { INhapKhoResponse } from "@/types/inventory-in"
import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import moment from "moment"



export const InventoryInColumns: ColumnDef<INhapKhoResponse>[] = [
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
        id: 'Số phiếu',
        accessorKey: "maHangHoa",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Số phiếu
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soPhieuNhap}</div>,
    },
    {
        id: 'Số PO',
        accessorKey: "tenHangHoa",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Số PO
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.DonHang?.soHopDong}</div>,
    },
    {
        id: 'Nhà cung cấp',
        header: 'Nhà cung cấp',
        accessorKey: "loaiHang",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.NhaCungCap?.maNhaCungCap}</div>,
    },
    {
        id: 'Kho',
        header: 'Kho',
        accessorKey: "kho",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.Kho?.maKho?.toUpperCase()}</div>,
    },
    {
        id: 'Ngày xuất',
        header: 'Ngày xuất',
        accessorKey: "ngayXuat",
        cell: ({ row }) => <div className="lowercase text-xs">{moment(row.original?.createdAt).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Tổng tiền',
        header: 'Tổng tiền',
        accessorKey: "tongTien",
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.totalIncludeTax))}</div>,
    },
    {
        id: 'Người xuất',
        header: 'Người xuất',
        accessorKey: "nguoiXuat",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.CreatedBy?.fullname}</div>,
    },
    {
        id: 'Trạng thái',
        header: 'Trạng thái',
        accessorKey: "trangThai",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.status}</div>,
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
                        <Link to="/inventory-in/$inventoryCode" params={{ inventoryCode: item?.soPhieuNhap }}>
                            <DropdownMenuItem className="text-blue-600">Chi tiết</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]