import { Button } from '@/components/ui/button';
import { IWarehouseInboundSearchHit } from '@/types/warehouse-inbound';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const WarehouseInboundSearchColumns: ColumnDef<IWarehouseInboundSearchHit>[] = [
  {
    id: 'No.',
    header: 'STT',
    cell: (ctx) => (
      <div className="text-xs">
        {ctx.row.index + 1 + ctx.table.getState().pagination.pageIndex * ctx.table.getState().pagination.pageSize}
      </div>
    ),
  },
  {
    accessorKey: 'requestNumber',
    header: ({ column }) => (
      <Button size="sm" variant="outline" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Mã DNTT
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.requestNumber}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => <div className="text-xs">{row.original.status}</div>,
  },
  {
    accessorKey: 'vendorName',
    header: 'Nhà cung cấp',
    cell: ({ row }) => <div className="text-xs">{row.original.vendorName}</div>,
  },
  {
    accessorKey: 'vendorCode',
    header: 'Mã NCC',
    cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.original.vendorCode}</div>,
  },
  {
    accessorKey: 'notes',
    header: 'Ghi chú',
    cell: ({ row }) => (
      <div className="max-w-[240px] truncate text-xs" title={row.original.notes}>
        {row.original.notes}
      </div>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link
          to="/warehouse-inbound/$paymentRequestId"
          params={{ paymentRequestId: row.original.paymentRequestId }}
        >
          Chi tiết
        </Link>
      </Button>
    ),
  },
];
