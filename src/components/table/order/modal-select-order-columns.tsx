import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/constants'
import { numberWithCommas } from '@/lib/other'
import { cn } from '@/lib/utils'
import { IOrderResponse } from '@/types/order'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'

export const ModalSelectOrderColumns: ColumnDef<IOrderResponse>[] = [
    {
        id: 'No.',
        header: 'No.',
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination
            return <div className="text-xs">{row.index + 1 + pageIndex * pageSize}</div>
        },
    },
    {
        id: 'Mã đơn hàng',
        accessorKey: 'orderNumber',
        header: 'Mã đơn hàng',
        cell: ({ row }) => (
            <div className="text-xs font-medium">
                {row.original?.orderPrefix}.{row.original?.orderNumber}
            </div>
        ),
    },
    {
        id: 'Khách hàng',
        accessorKey: 'customer',
        header: 'Khách hàng',
        cell: ({ row }) => (
            <div className="text-xs">{row.original?.customer?.name ?? '—'}</div>
        ),
    },
    {
        id: 'Số hợp đồng',
        accessorKey: 'contractNumber',
        header: 'Số hợp đồng',
        cell: ({ row }) => <div className="text-xs">{row.original?.contractNumber ?? '—'}</div>,
    },
    {
        id: 'Ngày đặt',
        accessorKey: 'orderDate',
        header: 'Ngày đặt',
        cell: ({ row }) => (
            <div className="text-xs">
                {row.original?.orderDate ? moment(row.original.orderDate).format('DD/MM/YYYY') : '—'}
            </div>
        ),
    },
    {
        id: 'Trạng thái',
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.original?.status ?? ''
            return (
                <Badge
                    variant="secondary"
                    className={cn('text-[10px]', ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES['DEFAULT'])}
                >
                    {ORDER_STATUS_LABELS[status] ?? status}
                </Badge>
            )
        },
    },
    {
        id: 'Thành tiền',
        accessorKey: 'finalAmount',
        header: 'Thành tiền',
        cell: ({ row }) => (
            <div className="text-xs font-medium tabular-nums">
                {numberWithCommas(Number(row.original?.finalAmount ?? 0))}
            </div>
        ),
    },
    {
        id: 'Số dòng',
        accessorKey: 'orderLines',
        header: 'Số dòng',
        cell: ({ row }) => (
            <div className="text-xs">{row.original?.orderLines?.length ?? 0}</div>
        ),
    },
]
