import { Button } from '@/components/ui/button';
import { WAREHOUSE_OUTBOUND_STATUS_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IWarehouseOutboundInfo } from '@/types/warehouse-outbound';
import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

export const WarehouseOutboundColumns: ColumnDef<IWarehouseOutboundInfo>[] = [
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
    accessorKey: 'outboundNumber',
    header: 'Số phiếu xuất',
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.outboundNumber || '—'}</div>,
  },
  {
    accessorKey: 'contractNumber',
    header: 'Số hợp đồng',
    cell: ({ row }) => <div className="text-xs">{row.original.contractNumber || '—'}</div>,
  },
  {
    accessorKey: 'outboundReason',
    header: 'Lý do',
    cell: ({ row }) => (
      <div className="max-w-[260px] truncate text-xs text-muted-foreground">{row.original.outboundReason || '—'}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const s = WAREHOUSE_OUTBOUND_STATUS_STYLES[row.original.status];
      return s ? <span className={cn(s.style, 'text-xs')}>{s.label}</span> : <div className="text-xs">{row.original.status}</div>;
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Tổng tiền',
    cell: ({ row }) => <div className="text-right text-xs tabular-nums">{Number(row.original.totalAmount ?? 0).toLocaleString('vi-VN')}</div>,
  },
  {
    accessorKey: 'outboundDate',
    header: 'Ngày xuất',
    cell: ({ row }) => <div className="text-xs">{row.original.outboundDate || '—'}</div>,
  },
  {
    accessorKey: 'createdBy',
    header: 'Người tạo',
    cell: ({ row }) => <div className="text-xs">{row.original.createdBy || '—'}</div>,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link to="/warehouse-outbound/$outboundId" params={{ outboundId: row.original.id }}>
          Chi tiết
        </Link>
      </Button>
    ),
  },
];
