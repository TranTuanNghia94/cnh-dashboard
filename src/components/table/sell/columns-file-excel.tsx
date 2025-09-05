import { numberWithCommas } from "@/lib/other"
import { ISellFileExcel } from "@/types/sell"
import { ColumnDef } from "@tanstack/react-table"


export const SellFileExcelColumns: ColumnDef<ISellFileExcel>[] = [
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
        id: 'SO HOP DONG',
        accessorKey: 'SO HOP DONG',
        cell: ({ row }) => <div className="text-xs">{row.original?.["SO HOP DONG"]}</div>,
        header: 'Số hợp đồng',
        enableColumnFilter: false,

    },
    {
        id: 'MA KHACH HANG',
        accessorKey: 'MA KHACH HANG',
        cell: ({ row }) => <div className="text-xs">{row.original?.["MA KHACH HANG"]}</div>,
        header: 'Khách hàng',
        enableColumnFilter: false,

    },
    {
        id: 'MA HANG CUSTOMER',
        accessorKey: 'MA HANG CUSTOMER',
        cell: ({ row }) => <div className="text-xs">{row.original?.["MA HANG CUSTOMER"]}</div>,
        header: 'Mã hàng',
        filterFn:'includesString',
        enableColumnFilter: true,

    },
    {
        id: 'TEN HANG',
        accessorKey: 'TEN HANG',
        header: 'Tên hàng',
        cell: ({ row }) => <div className="text-xs">{row.original?.["TEN HANG"]}</div>,
        filterFn:'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'VENDOR',
        header: 'Nhà cung cấp',
        accessorKey: "VENDOR",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.["VENDOR"]}</div>,
        filterFn: 'includesString',
        enableColumnFilter: true,
    },
    {
        id: 'Số lượng',
        accessorKey: 'soLuong',
        header: 'Số lượng',
        cell: ({ row }) => <div className="text-xs">{row.original?.["SL BAN"]}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn vị',
        accessorKey: 'donViTinh',
        header: 'Đơn vị',
        cell: ({ row }) => <div className="text-xs">{row.original?.["DON VI TINH 1"]}</div>,
        enableColumnFilter: false,
    },
    {
        id: 'Đơn giá',
        accessorKey: 'donGia',
        header: 'Đơn giá',
        cell: ({ row }) => {

            return <div className="text-xs">{numberWithCommas(Number(row.original?.["DON GIA BAN"]))}</div>
        },
        enableColumnFilter: false,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'thanhTien',
        header: 'Thành tiền',
        cell: ({ row }) => <div className="text-xs">{numberWithCommas(Number(row.original?.["THANH TIEN"]))}</div>,
        enableColumnFilter: false,
    },
    // {
    //     id: 'actions',
    //     header: '',
    //     enableColumnFilter: false,
    //     cell: ({ row }) => {
    //         const item = row.original

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild className="bg-transparent">
    //                     <Button
    //                         aria-haspopup="true"
    //                         size="sm"
    //                         variant="ghost"
    //                     >
    //                         <MoreVertical className="h-4 w-4" />
    //                         <span className="sr-only">Toggle menu</span>
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuItem asChild className="text-blue-600">
    //                         <SellDetailUpdate saveDetail={item.updateRow} data={item} />
    //                     </DropdownMenuItem>
    //                     <DropdownMenuItem className="text-red-600" onClick={item.deleteRow}>Xoá</DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     }
    // }
]