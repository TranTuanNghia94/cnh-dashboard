import { DataTable } from '@/components/table/data-table';
import { WarehouseInboundReceiptColumns } from '@/components/table/warehouse-inbound/columns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListWarehouseInbound, useSearchWarehouseInbound } from '@/hooks/use-warehouse-inbound';
import { WAREHOUSE_INBOUND_STATUS_STYLES } from '@/lib/constants';
import type { IWarehouseInboundReceiptInfo, IWarehouseInboundSearchHit } from '@/types/warehouse-inbound';
import { IRequestPaginationAndSearch } from '@/types/api';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { Loader2, Search } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  ...Object.entries(WAREHOUSE_INBOUND_STATUS_STYLES).map(([value, { label }]) => ({ value, label })),
];

const searchHitColumns: ColumnDef<IWarehouseInboundSearchHit>[] = [
  {
    id: 'No.',
    header: 'STT',
    cell: (ctx) => <div className="text-xs">{ctx.row.index + 1}</div>,
  },
  {
    accessorKey: 'requestNumber',
    header: 'Mã ĐNTT',
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.requestNumber}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => <div className="text-xs">{row.original.status}</div>,
  },
  {
    accessorKey: 'vendorName',
    header: 'Nhà cung cấp',
    cell: ({ row }) => <div className="text-xs">{row.original.vendorName || '—'}</div>,
  },
  {
    accessorKey: 'vendorCode',
    header: 'Mã NCC',
    cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.original.vendorCode || '—'}</div>,
  },
  {
    accessorKey: 'notes',
    header: 'Ghi chú',
    cell: ({ row }) => <div className="max-w-[200px] truncate text-xs text-muted-foreground">{row.original.notes || '—'}</div>,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link to="/warehouse-inbound/$paymentRequestId" params={{ paymentRequestId: row.original.paymentRequestId }}>
          Nhập kho
        </Link>
      </Button>
    ),
  },
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

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { mutateAsync: search, isPending: isSearchPending } = useSearchWarehouseInbound();
  const [notesContains, setNotesContains] = useState('');
  const [paperType, setPaperType] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [searchHits, setSearchHits] = useState<IWarehouseInboundSearchHit[]>([]);

  const runSearch = useCallback(async () => {
    const res = await search({
      notesContains: notesContains.trim() || undefined,
      paperType: paperType.trim() || undefined,
      paperCode: paperCode.trim() || undefined,
    });
    const hits = (res?.data as unknown as { hits?: IWarehouseInboundSearchHit[] })?.hits ?? [];
    setSearchHits(hits);
  }, [notesContains, paperCode, paperType, search]);

  const searchTable = useReactTable({
    data: searchHits,
    columns: searchHitColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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

        <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Tìm đề nghị thanh toán
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90%] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="uppercase">Tìm đề nghị thanh toán (nhập kho)</DialogTitle>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Đóng</Button>
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tìm theo ghi chú ĐNTT / dòng hàng, và theo chứng từ trên dòng PO (loại + mã).
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="wi-notes">Nội dung ghi chú</Label>
                  <Input id="wi-notes" value={notesContains} onChange={(e) => setNotesContains(e.target.value)} placeholder="notesContains" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wi-paper-type">Loại chứng từ</Label>
                  <Input id="wi-paper-type" value={paperType} onChange={(e) => setPaperType(e.target.value)} placeholder="VD: INVOICE, QUOTE…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wi-paper-code">Mã chứng từ</Label>
                  <Input id="wi-paper-code" value={paperCode} onChange={(e) => setPaperCode(e.target.value)} placeholder="paperCode" />
                </div>
                <div className="flex items-end">
                  <Button type="button" className="w-full gap-2" disabled={isSearchPending} onClick={() => void runSearch()}>
                    {isSearchPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {searchTable.getHeaderGroups().map((hg) => (
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
                  {searchTable.getRowModel().rows.length ? (
                    searchTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={searchHitColumns.length} className="h-24 text-center text-sm text-muted-foreground">
                        {isSearchPending ? 'Đang tải…' : 'Chưa có dữ liệu. Nhấn Tìm kiếm.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }, [searchModalOpen, notesContains, paperType, paperCode, isSearchPending, runSearch, searchTable, statusFilter, handleStatusChange]);

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
