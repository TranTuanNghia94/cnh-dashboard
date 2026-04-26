import { DataTable } from '@/components/table/data-table';
import { WarehouseInventoryColumns } from '@/components/table/warehouse-inventory/columns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useListWarehouseInventory } from '@/hooks/use-warehouse-inventory';
import { IRequestPaginationAndSearch } from '@/types/api';
import type { IWarehouseInventoryListResponse } from '@/types/warehouse-inventory';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inventory/')({
  component: WarehouseInventoryPage,
});

function WarehouseInventoryPage() {
  const { mutateAsync: listInventory, data: listData } = useListWarehouseInventory();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const searchRef = useRef(debouncedSearch);
  searchRef.current = debouncedSearch;

  const queryList = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const s = searchRef.current;
      await listInventory({
        page: req?.page ?? 0,
        limit: req?.limit ?? 10,
        ...(s ? { search: s } : {}),
      });
    },
    [listInventory],
  );

  const listTools = (
    <div className="flex max-w-sm items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pl-8 text-xs"
          placeholder="Tìm mã / tên sản phẩm…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 text-xs"
        onClick={() => setDebouncedSearch(searchInput.trim())}
      >
        Tìm
      </Button>
    </div>
  );

  const payload = listData?.data as IWarehouseInventoryListResponse | undefined;

  return (
    <div>
      <DataTable
        key={debouncedSearch}
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
