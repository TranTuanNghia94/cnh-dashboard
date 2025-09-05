import { IGoodsValidate } from "@/types/goods"
import { ColumnDef } from "@tanstack/react-table"


export const ModalValidateGoodsColumns: ColumnDef<IGoodsValidate>[] = [
    {
        id: 'NO.',
        accessorKey: 'ten',
        header: 'NO.',  
        enableColumnFilter: false,
        cell: (a) => <div className="text-xs">{a.row.index +1}</div>

    },
    {
        id: 'Số hợp đồng',
        accessorKey: "soHopDong",
        header: 'Số hợp đồng',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.soHopDong}</div>,
    },
    {
        id: 'Mã hàng',
        accessorKey: 'tenHang',
        header: 'Mã hàng',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="text-xs">{row.original.maHangHoa}</div>,
    },
    {
        id: 'Tên hàng',
        accessorKey: 'tenHang',
        header: 'Tên hàng',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="text-xs">{row.original.tenHangHoa}</div>,
    },
    {
        id: 'Ghi chú',
        accessorKey: 'ghiChu',
        header: 'Ghi chú',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="text-xs">{row.original.ghiChu}</div>,
    },
]