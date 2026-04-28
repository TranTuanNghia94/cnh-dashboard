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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSearchWarehouseInbound } from '@/hooks/use-warehouse-inbound';
import type { IWarehouseInboundSearchHit } from '@/types/warehouse-inbound';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { Loader2, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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

export function SearchPaymentRequestModal() {
  const [open, setOpen] = useState(false);
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

  const noResultMessage = useMemo(() => {
    if (isSearchPending) return 'Đang tải…';
    return 'Chưa có dữ liệu. Nhấn Tìm kiếm.';
  }, [isSearchPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          Tìm đề nghị thanh toán
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[90%] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="uppercase">Tìm đề nghị thanh toán (nhập kho)</DialogTitle>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tìm theo ghi chú ĐNTT / dòng hàng, và theo chứng từ trên dòng PO (loại + mã).</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="wi-notes">Nội dung ghi chú</Label>
              <Input id="wi-notes" value={notesContains} onChange={(e) => setNotesContains(e.target.value)} placeholder="notesContains" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wi-paper-type">Loại chứng từ</Label>
              <Input id="wi-paper-type" value={paperType} onChange={(e) => setPaperType(e.target.value)} placeholder="VD: INVOICE, QUOTE..." />
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
              {searchTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    {noResultMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
