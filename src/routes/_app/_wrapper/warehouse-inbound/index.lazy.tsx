import { WarehouseInboundSearchColumns } from '@/components/table/warehouse-inbound/columns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSearchWarehouseInbound } from '@/hooks/use-warehouse-inbound';
import { IWarehouseInboundSearchHit } from '@/types/warehouse-inbound';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Loader2, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

export const Route = createLazyFileRoute('/_app/_wrapper/warehouse-inbound/')({
  component: WarehouseInboundSearchPage,
});

function WarehouseInboundSearchPage() {
  const { mutateAsync: search, isPending } = useSearchWarehouseInbound();
  const [notesContains, setNotesContains] = useState('');
  const [paperType, setPaperType] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [hits, setHits] = useState<IWarehouseInboundSearchHit[]>([]);

  const runSearch = useCallback(async () => {
    const res = await search({
      notesContains: notesContains.trim() || undefined,
      paperType: paperType.trim() || undefined,
      paperCode: paperCode.trim() || undefined,
    });
    setHits(res?.data?.hits ?? []);
  }, [notesContains, paperCode, paperType, search]);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: hits,
    columns: WarehouseInboundSearchColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  });

  const pageCount = table.getPageCount();

  const paginationItems = useMemo(() => {
    const current = pagination.pageIndex;
    const items: (number | 'ellipsis')[] = [];
    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) items.push(i);
    } else {
      items.push(0);
      if (current > 2) items.push('ellipsis');
      const start = Math.max(1, current - 1);
      const end = Math.min(pageCount - 2, current + 1);
      for (let i = start; i <= end; i++) {
        if (!items.includes(i)) items.push(i);
      }
      if (current < pageCount - 3) items.push('ellipsis');
      if (!items.includes(pageCount - 1)) items.push(pageCount - 1);
    }
    return items;
  }, [pageCount, pagination.pageIndex]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wide">Tìm đề nghị thanh toán (nhập kho)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tìm theo ghi chú DNTT / dòng hàng, và theo chứng từ trên dòng PO (loại + mã).
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="wi-notes">Nội dung ghi chú</Label>
              <Input
                id="wi-notes"
                value={notesContains}
                onChange={(e) => setNotesContains(e.target.value)}
                placeholder="notesContains"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wi-paper-type">Loại chứng từ</Label>
              <Input
                id="wi-paper-type"
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                placeholder="VD: invoice, quote…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wi-paper-code">Mã chứng từ</Label>
              <Input
                id="wi-paper-code"
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value)}
                placeholder="paperCode"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" className="w-full gap-2" disabled={isPending} onClick={() => void runSearch()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Tìm kiếm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wide">Kết quả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={WarehouseInboundSearchColumns.length} className="h-24 text-center text-sm text-muted-foreground">
                      {isPending ? 'Đang tải…' : 'Chưa có dữ liệu. Nhấn Tìm kiếm.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {pageCount > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.previousPage();
                    }}
                    aria-disabled={!table.getCanPreviousPage()}
                    className={!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : ''}
                  >
                    Trước
                  </PaginationLink>
                </PaginationItem>
                {paginationItems.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <PaginationItem key={`e-${idx}`}>…</PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={pagination.pageIndex === item}
                        onClick={(e) => {
                          e.preventDefault();
                          table.setPageIndex(item);
                        }}
                      >
                        {item + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      table.nextPage();
                    }}
                    aria-disabled={!table.getCanNextPage()}
                    className={!table.getCanNextPage() ? 'pointer-events-none opacity-50' : ''}
                  >
                    Sau
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
