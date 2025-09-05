
import { numberWithCommas } from "@/lib/other"
import { IChiTietNhapKhoResponse } from "@/types/inventory-in"
import { ColumnDef } from "@tanstack/react-table"

export const InventoryInDetailColumns: ColumnDef<IChiTietNhapKhoResponse>[] = [
    {
        id: "No.",
        header: "No.",
        accessorKey: "No.",
        enableColumnFilter: false,
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs">{numb}</div>
        }

    },
    {
        id: "Khách hàng",
        accessorKey: "maHangHoa",
        header: "Khách hàng",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.KhachHang?.maKhachHang}</div>,
    },
    {
        id: "Code",
        accessorKey: "maHangHoa",
        header: "Code",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.HangHoa?.maHangHoa}</div>,
    },
    {
        id: "Tên hàng",
        header: 'Tên hàng',
        accessorKey: "tenHang",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.HangHoa?.tenHang}</div>,
    },
    {
        id: "Đơn vị",
        header: 'Đơn vị',
        accessorKey: "donViTinh",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.donViTinh}</div>,
    },
    {
        id: "Số lượng",
        header: 'Số lượng',
        accessorKey: "soLuong",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soLuong}</div>,
    },
    {
        id: "Đơn giá",
        header: 'Đơn giá',
        accessorKey: "donGia",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.donGia))}</div>,
    },
    {
        id: "Thành tiền",
        header: 'Thành tiền',
        accessorKey: "thanhTien",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.thanhTien))}</div>,
    },
    {
        id: "Thuế",
        header: 'Thuế',
        accessorKey: "thue",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.thue}</div>,
    },
    {
        id: "Tiền thuế",
        header: 'Tiền thuế',
        accessorKey: "tienThue",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.tienThue))}</div>,
    },
    {
        id: "Tổng tiền",
        header: 'Tổng tiền',
        accessorKey: "tongTien",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{numberWithCommas(Number(row.original?.thanhTien) + Number(row.original?.tienThue))}</div>,
    },
    {
        id: "Tiền tệ",
        header: 'Tiền tệ',
        accessorKey: "tienTe",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.tienTe}</div>,
    },
    {
        id: "Bill sổ sách",
        header: 'Bill sổ sách',
        accessorKey: "billSoSach",
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.billSoSach}</div>,
    },
    {
        id: "Ghi chú",
        header: 'Ghi chú',
        accessorKey: "ghiChu",
        enableColumnFilter: false,
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.ghiChu}</div>,
    },
]