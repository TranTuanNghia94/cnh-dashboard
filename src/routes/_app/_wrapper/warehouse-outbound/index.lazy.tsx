import { DataTable } from '@/components/table/data-table';
import { FilterFieldGroup, FilterTextField } from '@/components/table/list-filter-fields';
import { ListFilterBar } from '@/components/table/list-filter-bar';
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
  const [filters, setFilters] = useState({
    createdBy: '',
    outboundNumber: '',
    contractNumber: '',
  });
  const statusRef = useRef(statusFilter);
  const filtersRef = useRef(filters);
  statusRef.current = statusFilter;
  filtersRef.current = filters;

  const queryAllOutbound = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const status = statusRef.current === 'ALL' ? undefined : statusRef.current;
      const activeFilters = Object.fromEntries(
        Object.entries(filtersRef.current).filter(([, value]) => String(value).trim() !== '')
      );
      await listOutbound({
        page: req?.page ?? 0,
        limit: req?.limit ?? 10,
        ...(status ? { status } : {}),
        ...activeFilters,
      });
    },
    [listOutbound],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      statusRef.current = value;
      void queryAllOutbound({ page: 0, limit: 10 });
    },
    [queryAllOutbound],
  );

  const applyFilters = useCallback(() => {
    void queryAllOutbound({ page: 0, limit: 10 });
  }, [queryAllOutbound]);

  const resetFilters = useCallback(() => {
    const nextFilters = { createdBy: '', outboundNumber: '', contractNumber: '' };
    setFilters(nextFilters);
    filtersRef.current = nextFilters;
    setStatusFilter('ALL');
    statusRef.current = 'ALL';
    void queryAllOutbound({ page: 0, limit: 10 });
  }, [queryAllOutbound]);

  const listTools = useMemo(
    () => (
      <ListFilterBar
        onApply={applyFilters}
        onReset={resetFilters}
        rightActions={
          <Button size="sm" asChild>
            <Link to="/warehouse-outbound/new">Tạo phiếu xuất</Link>
          </Button>
        }
        activeFilterCount={
          Object.values(filters).filter((value) => value.trim() !== '').length +
          (statusFilter === 'ALL' ? 0 : 1)
        }
      >
        <FilterTextField label="Người tạo" value={filters.createdBy} onChange={(value) => setFilters((prev) => ({ ...prev, createdBy: value }))} placeholder="warehouse01" />
        <FilterTextField label="Số xuất kho" value={filters.outboundNumber} onChange={(value) => setFilters((prev) => ({ ...prev, outboundNumber: value }))} placeholder="WHO.11" />
        <FilterTextField label="Số hợp đồng" value={filters.contractNumber} onChange={(value) => setFilters((prev) => ({ ...prev, contractNumber: value }))} placeholder="HD-2026-01" />
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
    ),
    [applyFilters, filters.contractNumber, filters.createdBy, filters.outboundNumber, handleStatusChange, resetFilters, statusFilter],
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
