import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useGetOrders } from '@/hooks/use-order'
import { IOrderResponse } from '@/types/order'
import { IRequestPaginationAndSearch } from '@/types/api'
import { useEffect, useState } from 'react'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { numberWithCommas } from '@/lib/other'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Loader2, Search } from 'lucide-react'
import moment from 'moment'

type Props = {
    onSelectOrder: (order: IOrderResponse) => void | Promise<void>
    disabled?: boolean
}

const orderColumns: ColumnDef<IOrderResponse>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
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
        cell: (a) => <div className="text-xs">{a.row.index + 1}</div>
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
        cell: ({ row }) => <div className="text-xs">{row.original?.contractNumber}</div>,
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
                <Badge variant="secondary" className={cn('text-[10px]', ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES['DEFAULT'])}>
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

const SelectOrder = ({ onSelectOrder, disabled }: Props) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [isConfirming, setIsConfirming] = useState(false)
    const { mutateAsync, data, isPending } = useGetOrders()
    const [selectedRow, setSelectedRow] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (open) {
            mutateAsync({ page: 0, limit: 50 })
        }
    }, [open, mutateAsync])

    const handleSearch = () => {
        mutateAsync({ page: 0, limit: 50, search } as IRequestPaginationAndSearch)
    }

    const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const handleConfirm = async () => {
        const orders = data?.data?.data ?? []
        const selectedIndex = Object.keys(selectedRow).find(key => selectedRow[key])
        if (selectedIndex === undefined) return
        const order = orders[Number(selectedIndex)]
        if (!order) return
        setIsConfirming(true)
        try {
            await Promise.resolve(onSelectOrder(order))
            setOpen(false)
            setSelectedRow({})
        } finally {
            setIsConfirming(false)
        }
    }

    const hasSelection = Object.values(selectedRow).some(Boolean)
    const isBusy = disabled || isConfirming

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" size="sm" disabled={isBusy}>Chọn đơn hàng</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
                <DialogHeader>
                    <div className="flex justify-between">
                        <DialogTitle className="uppercase">Chọn đơn hàng</DialogTitle>
                        <div className="flex gap-x-4">
                            <Button
                                size="sm"
                                onClick={() => void handleConfirm()}
                                disabled={!hasSelection || isBusy}
                            >
                                {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận'}
                            </Button>
                            <DialogClose asChild>
                                <Button size="sm" variant="outline">Đóng</Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex gap-x-2 mb-2">
                    <Input
                        placeholder="Tìm theo mã đơn hàng, khách hàng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearchEnter}
                    />
                    <Button size="sm" onClick={handleSearch} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>

                <DataTableDetail
                    wrapperClassName="h-[calc(75vh-175px)]"
                    data={data?.data?.data ?? []}
                    columns={orderColumns}
                    noDataText="Không tìm thấy đơn hàng nào."
                    rowSelect={setSelectedRow}
                />
            </DialogContent>
        </Dialog>
    )
}

export default SelectOrder
