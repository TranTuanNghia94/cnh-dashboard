import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IPurchaseOrderResponse } from "@/types/purchase";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { Link } from "@tanstack/react-router";


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
        id: 'Người tạo',
        header: 'Người tạo',
        cell: ({ row }) => <div className="text-xs">{row.original?.createdBy}</div>,
    },
    {
        id: 'Số hợp đồng',
        header: 'Số hợp đồng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.order?.contractNumber}</div>,
    },
    {
        id: 'Mã đơn hàng',
        header: 'Mã đơn hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.order?.orderPrefix}.{row.original?.order?.orderNumber.toString().padStart(3, '0')}</div>,
    },
    {
        id: 'Khách hàng',
        header: 'Khách hàng',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.order?.customer?.name}</div>,
    },
    {
        id: 'Thành tiền',
        header: 'Thành tiền',
        filterFn: 'includesString',
        cell: ({ row }) => <div className="text-xs">{row.original?.notes?.replace(/,/g, '.')}</div>,
    },
    {
        id: 'Tiến độ',
        header: 'Tiến độ',
        enableColumnFilter: false,
        cell: ({ row }) => {
            const rawPct = row.original?.processPercentage
            if (rawPct === null || rawPct === undefined) {
                return <div className="text-xs text-muted-foreground">—</div>
            }

            const pct = Math.max(0, Math.min(100, Number(rawPct)))
            const toneClass =
                pct >= 100
                    ? "bg-emerald-100 text-emerald-700"
                    : pct >= 70
                        ? "bg-sky-100 text-sky-700"
                        : pct >= 30
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"

            return (
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${toneClass}`}>
                    {pct.toFixed(2)}%
                </span>
            )
        },
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="sm" variant="ghost" className="bg-transparent">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="text-orange-500">
                        <Link to="/purchase/$purchaseId" params={{ purchaseId: row.original.poPrefix + "." + row.original.poNumber.toString().padStart(3, '0') }}>Cập nhật</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Xoá</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    }
]