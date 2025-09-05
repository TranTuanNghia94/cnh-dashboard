import UpdateCustomerAddress from "@/components/modal/customer/customer-address-update";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ICustomerAddressInput } from "@/types/customer";
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react";


export type ICustomerAddressExtends = ICustomerAddressInput & {
    deleteRow: () => void
    updateRow: (val: ICustomerAddressInput) => void
}

export const CustomerAddressColumns: ColumnDef<ICustomerAddressExtends>[] = [
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
        id: 'Người liên hệ',
        accessorKey: 'tenNguoiLienHe',
        enableColumnFilter: false,
        header: 'Người liên hệ',
        cell: ({ row }) => <div className="text-xs">{row.original?.tenNguoiLienHe}</div>

    },
    {
        id: 'Số ĐT',
        accessorKey: "soDienThoai",
        enableColumnFilter: false,
        header: 'Số ĐT',
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.soDienThoai}</div>,
    },
    {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="text-xs">{row.original?.email}</div>,
    },
    {
        id: 'soNhaTenDuong_1',
        accessorKey: 'soNhaTenDuong_1',
        enableColumnFilter: false,
        header: 'Địa chỉ',
        cell: ({ row }) => <div className="text-xs">{row.original?.soNhaTenDuong_1}</div>,
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
                        <DropdownMenuItem asChild className="text-blue-600">
                            <UpdateCustomerAddress saveDetail={item?.updateRow} data={item} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={item?.deleteRow} className="text-red-600">Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]