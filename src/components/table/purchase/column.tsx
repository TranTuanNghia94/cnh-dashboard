import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { numberWithCommas } from "@/lib/other";
import { IPurchaseOrderResponse } from "@/types/purchase";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";


export type IPurchaseOrderExtends = IPurchaseOrderResponse & { refetch: () => void }

export const PurchaseOrderColumns: ColumnDef<IPurchaseOrderExtends>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all" />
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
        id: 'PO',
        accessorKey: "poNumber",
        header: 'PO',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.poNumber}</div>,
    },
    {
        id: 'Ngày PO',
        accessorKey: 'orderDate',
        header: 'Ngày PO',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.orderDate}</div>,
    },
    {
        id: 'Ngày hoàn thành',
        accessorKey: 'expectedDeliveryDate',
        header: 'Ngày hoàn thành',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.expectedDeliveryDate}</div>,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'finalAmount',
        header: 'Thành tiền',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{numberWithCommas(Number(row.original?.finalAmount))}</div>,
    },
    {
        id: 'actions',
        header: '',
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="sm" variant="ghost" className="bg-transparent">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-blue-600">Cập nhật</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Xoá</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    }
]