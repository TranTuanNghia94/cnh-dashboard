import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { numberWithCommas } from "@/lib/other"
import { IPaymentResponse } from "@/types/payment"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import moment from 'moment'

const renderStatus = (item: IPaymentResponse) => {
    if (item?.LichSuDuyet_s?.some((val) => !val.approved) || item.status === 'REJECTED') {
        return 'Bị từ chối';
    }
    switch (item.status) {
        case 'DRAFT':
            return 'Nháp';
        case 'OPEN':
        case 'IN_PROGRESS':
            return <div className='font-bold text-orange-500'>Xử lý</div>;
        case 'APPROVED':
            return <div className='text-blue-500 font-bold'>Duyệt</div>
        case 'PAID':
            return <div className='text-green-500 font-bold'>Thanh toán</div>;
        default:
            return 'Nháp';
    }
};


export const PaymentColumns: ColumnDef<IPaymentResponse>[] = [
    {
        id: 'No.',
        header: 'No.',
        accessorKey: 'stt',
        cell: (a) =>{
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return  <div className="text-xs">{numb}</div>
        }

    },
    {
        id: 'Người tạo',
        accessorKey: 'fullname',
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
        id: 'Mã DNTT',
        accessorKey: "maDeNghiThanhToan",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã DNTT
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.maDeNghiThanhToan}</div>,
    },
    {
        id: 'Chứng từ',
        accessorKey: 'ghiChu',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Chứng từ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.ghiChu}</div>,
    },
    {
        id: 'Khách hàng',
        accessorKey: 'customer',
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
        cell: ({ row }) => <div className="text-xs">{row.original?.customer}</div>,
    },
    {
        id: 'Nhà cung cấp',
        accessorKey: 'maNhaCungCap',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nhà cung cấp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.ThanhToanCho?.maNhaCungCap}</div>,
    },
    {
        id: 'Deadline',
        accessorKey: 'hanThanhToan',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Deadline
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{moment(row.original?.hanThanhToan).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Tỷ lệ',
        accessorKey: 'tyLeThanhToan',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tỷ lệ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.tyLeThanhToan}%</div>,
    },
    {
        id: 'Tổng tiền',
        accessorKey: 'donViTinh',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tổng tiền
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{numberWithCommas(Number(row.original.tongSoTienCanThanhToan || 0))} {row.original?.ngoaiTe}</div>,
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
        cell: ({ row }) => {
            if (row.original.status === "PAID") {
                return <Badge variant={"success"}>BankNote</Badge>
            }

            return null
        },
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
        cell: ({ row }) => <div className="text-xs">{renderStatus(row.original)}</div>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const item = row.original
            console.log(item)
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
                        <DropdownMenuItem className="text-blue-600">Câp nhật</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]