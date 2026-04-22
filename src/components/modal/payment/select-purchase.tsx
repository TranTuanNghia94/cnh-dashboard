import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTableDetail } from '@/components/table/data-table-detail'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useGetPurchases } from '@/hooks/use-purchase'
import { IPurchaseOrderResponse } from '@/types/purchase'
import { IRequestPaginationAndSearch } from '@/types/api'
import { ColumnDef } from '@tanstack/react-table'
import { numberWithCommas } from '@/lib/other'
import { cn } from '@/lib/utils'
import { Loader2, Search } from 'lucide-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

const PURCHASE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  CONFIRMED: 'Đã xác nhận',
  IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
}

const PURCHASE_STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  DEFAULT: 'bg-muted text-muted-foreground',
}

const purchaseColumns: ColumnDef<IPurchaseOrderResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
    enableSorting: false,
  },
  {
    id: 'No.',
    header: 'No.',
    cell: (a) => <div className="text-xs">{a.row.index + 1}</div>,
  },
  {
    id: 'Mã PO',
    accessorKey: 'poNumber',
    header: 'Mã PO',
    cell: ({ row }) => (
      <div className="text-xs font-medium">
        {row.original.poPrefix}-{row.original.poNumber}
      </div>
    ),
  },
  {
    id: 'Đơn hàng',
    accessorKey: 'order',
    header: 'Đơn hàng',
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.order?.orderPrefix}-{row.original.order?.orderNumber}
      </div>
    ),
  },
  {
    id: 'Ngày PO',
    accessorKey: 'orderDate',
    header: 'Ngày PO',
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.orderDate ? moment(row.original.orderDate).format('DD/MM/YYYY') : '—'}
      </div>
    ),
  },
  {
    id: 'Trạng thái',
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.original.status ?? ''
      return (
        <Badge
          variant="secondary"
          className={cn('text-[10px]', PURCHASE_STATUS_STYLES[status] ?? PURCHASE_STATUS_STYLES['DEFAULT'])}
        >
          {PURCHASE_STATUS_LABELS[status] ?? status}
        </Badge>
      )
    },
  },
  {
    id: 'Tổng tiền (VND)',
    accessorKey: 'totalAmountVnd',
    header: 'Tổng tiền (VND)',
    cell: ({ row }) => (
      <div className="text-xs font-medium tabular-nums">
        {numberWithCommas(Number(row.original.totalAmountVnd ?? 0))}
      </div>
    ),
  },
  {
    id: 'Số dòng',
    accessorKey: 'purchaseOrderLines',
    header: 'Số dòng',
    cell: ({ row }) => (
      <div className="text-xs">{row.original.purchaseOrderLines?.length ?? 0}</div>
    ),
  },
]

type Props = {
  onSelectPurchase: (po: IPurchaseOrderResponse) => void | Promise<void>
  disabled?: boolean
}

const SelectPurchase = ({ onSelectPurchase, disabled }: Props) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const { mutateAsync, data, isPending } = useGetPurchases()
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
    const purchases = data?.data?.data ?? []
    const selectedIndex = Object.keys(selectedRow).find((key) => selectedRow[key])
    if (selectedIndex === undefined) return
    const po = purchases[Number(selectedIndex)]
    if (!po) return
    setIsConfirming(true)
    try {
      await Promise.resolve(onSelectPurchase(po))
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
        <Button type="button" size="sm" disabled={isBusy}>
          Chọn đơn mua hàng
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%]" onInteractOutside={(e) => { e.preventDefault() }}>
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle className="uppercase">Chọn đơn mua hàng (PO)</DialogTitle>
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
            placeholder="Tìm theo mã PO..."
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
          columns={purchaseColumns}
          noDataText="Không tìm thấy đơn mua hàng nào."
          rowSelect={setSelectedRow}
        />
      </DialogContent>
    </Dialog>
  )
}

export default SelectPurchase
