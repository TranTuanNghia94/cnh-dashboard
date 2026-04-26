import { Button } from '@/components/ui/button';
import type { IWarehouseInventoryBalanceInfo } from '@/types/warehouse-inventory';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';

export const WarehouseInventoryColumns: ColumnDef<IWarehouseInventoryBalanceInfo>[] = [
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
    accessorKey: 'productCode',
    header: 'Mã SP',
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.productCode}</div>,
  },
  {
    accessorKey: 'productName',
    header: 'Tên SP',
    cell: ({ row }) => <div className="text-xs">{row.original.productName}</div>,
  },
  {
    accessorKey: 'quantityOnHand',
    header: 'SL tồn',
    cell: ({ row }) => <div className="text-xs tabular-nums">{row.original.quantityOnHand}</div>,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link
          to="/warehouse-inventory/transactions/$productId"
          params={{ productId: row.original.productId }}
        >
          Giao dịch
        </Link>
      </Button>
    ),
  },
];
