import { Button } from '@/components/ui/button';
import { WAREHOUSE_INBOUND_STATUS_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { IWarehouseInboundReceiptInfo } from '@/types/warehouse-inbound';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const WarehouseInboundReceiptColumns: ColumnDef<IWarehouseInboundReceiptInfo>[] = [
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
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <Button size="sm" variant="outline" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Người tạo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.createdBy}</div>,
  },
  {
    accessorKey: 'receiptNumber',
    header: ({ column }) => (
      <Button size="sm" variant="outline" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Số phiếu nhập
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.receiptNumber}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const s = WAREHOUSE_INBOUND_STATUS_STYLES[row.original.status];
      return s ? (
        <span className={cn(s.style, 'text-xs')}>{s.label}</span>
      ) : (
        <div className="text-xs">{row.original.status}</div>
      );
    },
  },
  {
    accessorKey: 'receivedDate',
    header: 'Ngày nhận',
    cell: ({ row }) => <div className="text-xs">{row.original.receivedDate || '—'}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    cell: ({ row }) => (
      <div className="text-xs">{row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('vi-VN') : '—'}</div>
    ),
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-xs text-muted-foreground">{row.original.note || '—'}</div>
    ),
  },
  {
    accessorKey: 'contractNumber',
    header: 'Số hợp đồng',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-xs text-muted-foreground">{row.original.orders?.[0]?.contractNumber || '—'}</div>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Khách hàng',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-xs text-muted-foreground">{row.original.orders?.[0]?.customerName || '—'}</div>
    ),
  },
  {
    accessorKey: 'orderNumber',
    header: 'Mã đơn hàng',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-xs text-muted-foreground">{row.original.orders?.[0]?.orderNumber || '—'}</div>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link
          to="/warehouse-inbound/receipt/$receiptId"
          params={{ receiptId: row.original.id }}
        >
          Chi tiết
        </Link>
      </Button>
    ),
  },
];
