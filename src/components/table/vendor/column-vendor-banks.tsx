import UpdateVendorBanks from "@/components/modal/vendor/vendor-banks-update";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IVendorBanksCreateRequest } from "@/types/vendor";
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react";


export type IVendorBanksExtends = IVendorBanksCreateRequest & {
    deleteRow: () => void
    updateRow: (val: IVendorBanksCreateRequest) => void
}

export const VendorBanksColumns: ColumnDef<IVendorBanksExtends>[] = [
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
        id: 'Tên ngân hàng',
        accessorKey: 'bankName',
        enableColumnFilter: false,
        header: 'Tên ngân hàng',
        cell: ({ row }) => <div className="text-xs">{row.original?.bankName}</div>

    },
    {
        id: 'Tên tài khoản',
        accessorKey: "bankAccountName",
        enableColumnFilter: false,
        header: 'Tên tài khoản',
        cell: ({ row }) => <div className="lowercase text-xs">{row.original?.bankAccountName}</div>,
    },
    {
        id: 'Số tài khoản',
        accessorKey: 'bankAccountNumber',
        header: 'Số tài khoản',
        enableColumnFilter: false,
        cell: ({ row }) => <div className="text-xs">{row.original?.bankAccountNumber}</div>
    },
    {
        id: 'Chi nhánh',
        accessorKey: 'bankAccountBranch',
        enableColumnFilter: false,
        header: 'Chi nhánh',
        cell: ({ row }) => <div className="text-xs">{row.original?.bankAccountBranch}</div>
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
                            <UpdateVendorBanks saveDetail={item?.updateRow} data={item} />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={item?.deleteRow} className="text-red-600">Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]