import { DataTable } from '@/components/table/data-table';
import { FilterFieldGroup, FilterTextField } from '@/components/table/list-filter-fields';
import { ListFilterBar } from '@/components/table/list-filter-bar';
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
  const [filters, setFilters] = useState({
    createdBy: '',
    inboundNumber: '',
    contractNumber: '',
    customerName: '',
    orderNumber: '',
  });
  const statusRef = useRef(statusFilter);
  const filtersRef = useRef(filters);
  statusRef.current = statusFilter;
  filtersRef.current = filters;

  const queryAllInbound = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const status = statusRef.current === 'ALL' ? undefined : statusRef.current;
      const activeFilters = Object.fromEntries(
        Object.entries(filtersRef.current).filter(([, value]) => String(value).trim() !== '')
      );
      await listInbound({
        page: req?.page ?? 0,
        limit: req?.limit ?? 10,
        ...(status ? { status } : {}),
        ...activeFilters,
      });
    },
    [listInbound],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      statusRef.current = value;
      void queryAllInbound({ page: 0, limit: 10 });
    },
    [queryAllInbound],
  );

  const applyFilters = useCallback(() => {
    void queryAllInbound({ page: 0, limit: 10 });
  }, [queryAllInbound]);

  const resetFilters = useCallback(() => {
    const nextFilters = {
      createdBy: '',
      inboundNumber: '',
      contractNumber: '',
      customerName: '',
      orderNumber: '',
    };
    setFilters(nextFilters);
    filtersRef.current = nextFilters;
    setStatusFilter('ALL');
    statusRef.current = 'ALL';
    void queryAllInbound({ page: 0, limit: 10 });
  }, [queryAllInbound]);

  const listTools = useMemo(() => {
    return (
      <ListFilterBar
        onApply={applyFilters}
        onReset={resetFilters}
        rightActions={<SearchPaymentRequestModal />}
        activeFilterCount={
          Object.values(filters).filter((value) => value.trim() !== '').length +
          (statusFilter === 'ALL' ? 0 : 1)
        }
      >
        <FilterTextField label="Người tạo" value={filters.createdBy} onChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))} placeholder="warehouse01" />
        <FilterTextField label="Số nhập kho" value={filters.inboundNumber} onChange={(value) => setFilters((prev) => ({ ...prev, inboundNumber: value }))} placeholder="WHI.10" />
        <FilterTextField label="Số hợp đồng" value={filters.contractNumber} onChange={(value) => setFilters((prev) => ({ ...prev, contractNumber: value }))} placeholder="HD-2026-01" />
        <FilterTextField label="Khách hàng" value={filters.customerName} onChange={(value) => setFilters((prev) => ({ ...prev, customerName: value }))} placeholder="An Phát" />
        <FilterTextField label="Số đơn hàng" value={filters.orderNumber} onChange={(value) => setFilters((prev) => ({ ...prev, orderNumber: value }))} placeholder="SO.12" />
        <FilterFieldGroup label="Trạng thái">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterFieldGroup>
      </ListFilterBar>
    );
  }, [applyFilters, filters.contractNumber, filters.createdBy, filters.customerName, filters.inboundNumber, filters.orderNumber, handleStatusChange, resetFilters, statusFilter]);

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
