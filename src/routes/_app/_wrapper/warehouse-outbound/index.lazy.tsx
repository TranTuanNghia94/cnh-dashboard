import { DataTable } from '@/components/table/data-table';
import { WarehouseOutboundColumns } from '@/components/table/warehouse-outbound/columns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListWarehouseOutbound } from '@/hooks/use-warehouse-outbound';
import { WAREHOUSE_OUTBOUND_STATUS_STYLES } from '@/lib/constants';
import type { IRequestPaginationAndSearch } from '@/types/api';
import type { IWarehouseOutboundInfo } from '@/types/warehouse-outbound';
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useRef, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  ...Object.entries(WAREHOUSE_OUTBOUND_STATUS_STYLES).map(([value, { label }]) => ({ value, label })),
];

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-outbound/')({
  component: WarehouseOutboundPage,
});

function WarehouseOutboundPage() {
  const { mutateAsync: listOutbound, data: listData } = useListWarehouseOutbound();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const statusRef = useRef(statusFilter);
  statusRef.current = statusFilter;

  const queryAllOutbound = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const status = statusRef.current === 'ALL' ? undefined : statusRef.current;
      await listOutbound({ body: { page: req?.page ?? 0, limit: req?.limit ?? 10 }, status });
    },
    [listOutbound],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      const status = value === 'ALL' ? undefined : value;
      void listOutbound({ body: { page: 0, limit: 10 }, status });
    },
    [listOutbound],
  );

  const listTools = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" asChild>
          <Link to="/warehouse-outbound/new">Tạo phiếu xuất</Link>
        </Button>
      </div>
    ),
    [statusFilter, handleStatusChange],
  );

  const payload = listData?.data as
    | { data?: IWarehouseOutboundInfo[]; pagination?: { total?: number } }
    | undefined;

  return (
    <DataTable
      listTools={listTools}
      fetchData={(req) => queryAllOutbound(req as IRequestPaginationAndSearch)}
      total={payload?.pagination?.total}
      title="DANH SÁCH XUẤT KHO"
      data={payload?.data ?? []}
      columns={WarehouseOutboundColumns}
    />
  );
}
