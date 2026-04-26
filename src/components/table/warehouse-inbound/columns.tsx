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
    id: 'orders',
    header: 'Đơn bán hàng liên quan',
    cell: ({ row }) => {
      const orders = row.original.orders ?? [];
      if (!orders.length) return <div className="text-xs text-muted-foreground">—</div>;
      return (
        <div className="space-y-1">
          {orders.map((o) => (
            <div key={o.orderId} className="text-xs leading-tight">
              <span className="font-medium">{o.orderNumber}</span>
              {(o.contractNumber || o.customerName) && (
                <span className="ml-1 text-muted-foreground">
                  {o.contractNumber ? `HĐ: ${o.contractNumber}` : ''}
                  {o.contractNumber && o.customerName ? ' — ' : ''}
                  {o.customerName ? `KH: ${o.customerName}` : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    },
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
