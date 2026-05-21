import { DataTable } from '@/components/table/data-table';
import { FilterTextField } from '@/components/table/list-filter-fields';
import { ListFilterBar } from '@/components/table/list-filter-bar';
import { WarehouseInventoryColumns } from '@/components/table/warehouse-inventory/columns';
import { ExportJobButton } from '@/components/export/export-job-button';
import { useListWarehouseInventory } from '@/hooks/use-warehouse-inventory';
import { IRequestPaginationAndSearch } from '@/types/api';
import type { IWarehouseInventoryListResponse } from '@/types/warehouse-inventory';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCallback, useRef, useState } from 'react';

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inventory/')({
  component: WarehouseInventoryPage,
});

function WarehouseInventoryPage() {
  const { mutateAsync: listInventory, data: listData } = useListWarehouseInventory();
  const [filters, setFilters] = useState({
    productCode: '',
    productName: '',
    productCategory: '',
  });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const queryList = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const activeFilters = Object.fromEntries(
        Object.entries(filtersRef.current).filter(([, value]) => String(value).trim() !== '')
      );
      await listInventory({
        page: req?.page ?? 0,
        limit: req?.limit ?? 10,
        ...activeFilters,
      });
    },
    [listInventory],
  );

  const applyFilters = useCallback(() => {
    void queryList({ page: 0, limit: 10 });
  }, [queryList]);

  const resetFilters = useCallback(() => {
    const nextFilters = { productCode: '', productName: '', productCategory: '' };
    setFilters(nextFilters);
    filtersRef.current = nextFilters;
    void queryList({ page: 0, limit: 10 });
  }, [queryList]);

  const listTools = (
    <ListFilterBar
      onApply={applyFilters}
      onReset={resetFilters}
      rightActions={<ExportJobButton type="WAREHOUSE_INVENTORY" />}
      activeFilterCount={Object.values(filters).filter((value) => value.trim() !== '').length}
    >
      <FilterTextField label="Mã sản phẩm" value={filters.productCode} onChange={(value) => setFilters((prev) => ({ ...prev, productCode: value }))} placeholder="SP..." />
      <FilterTextField label="Tên sản phẩm" value={filters.productName} onChange={(value) => setFilters((prev) => ({ ...prev, productName: value }))} placeholder="Bolt..." />
      <FilterTextField label="Nhóm sản phẩm" value={filters.productCategory} onChange={(value) => setFilters((prev) => ({ ...prev, productCategory: value }))} placeholder="Fastener" />
    </ListFilterBar>
  );

  const payload = listData?.data as IWarehouseInventoryListResponse | undefined;

  return (
    <div>
      <DataTable
        listTools={listTools}
        fetchData={(req) => queryList(req as IRequestPaginationAndSearch)}
        total={payload?.pagination?.total}
        title="DANH SÁCH TỒN KHO (WAREHOUSE)"
        data={payload?.data ?? []}
        columns={WarehouseInventoryColumns}
      />
    </div>
  );
}
