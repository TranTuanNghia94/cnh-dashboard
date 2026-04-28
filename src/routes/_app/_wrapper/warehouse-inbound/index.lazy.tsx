import { DataTable } from '@/components/table/data-table';
import { WarehouseInboundReceiptColumns } from '@/components/table/warehouse-inbound/columns';
import { SearchPaymentRequestModal } from '@/components/warehouse-inbound/search-payment-request-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListWarehouseInbound } from '@/hooks/use-warehouse-inbound';
import { WAREHOUSE_INBOUND_STATUS_STYLES } from '@/lib/constants';
import type { IWarehouseInboundReceiptInfo } from '@/types/warehouse-inbound';
import { IRequestPaginationAndSearch } from '@/types/api';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useRef, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  ...Object.entries(WAREHOUSE_INBOUND_STATUS_STYLES).map(([value, { label }]) => ({ value, label })),
];

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inbound/')({
  component: WarehouseInboundPage,
});

function WarehouseInboundPage() {
  const { mutateAsync: listInbound, data: listData } = useListWarehouseInbound();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const statusRef = useRef(statusFilter);
  statusRef.current = statusFilter;

  const queryAllInbound = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const status = statusRef.current === 'ALL' ? undefined : statusRef.current;
      await listInbound({ body: { page: req?.page ?? 0, limit: req?.limit ?? 10 }, status });
    },
    [listInbound],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      const status = value === 'ALL' ? undefined : value;
      void listInbound({ body: { page: 0, limit: 10 }, status });
    },
    [listInbound],
  );

  const listTools = useMemo(() => {
    return (
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
        <SearchPaymentRequestModal />
      </div>
    );
  }, [statusFilter, handleStatusChange]);

  const payload = listData?.data as
    | { data?: IWarehouseInboundReceiptInfo[]; pagination?: { total?: number } }
    | undefined;

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryAllInbound(req as IRequestPaginationAndSearch)}
        total={payload?.pagination?.total}
        title="DANH SÁCH NHẬP KHO ĐÃ TẠO"
        data={payload?.data ?? []}
        columns={WarehouseInboundReceiptColumns}
      />
    </div>
  );
}
