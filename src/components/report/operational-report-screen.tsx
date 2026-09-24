import { findReport, type ReportFilter, type ReportSearchKey } from '@/components/report/report-catalog'
import { StockDetailDialog } from '@/components/report/stock-detail-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCreateReportExportJob } from '@/hooks/use-export-job'
import { useOperationalReport } from '@/hooks/use-operational-report'
import { useToast } from '@/hooks/use-toast'
import { OperationalReportQuery, type StockLedgerRow } from '@/types/operational-report'
import { cn } from '@/lib/utils'
import { IRequestPaginationAndSearch } from '@/types/api'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Download, Loader2, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type OperationalReportScreenProps<T> = {
  title: string
  path: string
  columns: ColumnDef<T, unknown>[]
}

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1)

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

type ReportFilters = {
  month: number
  year: number
  fromDate: string
  toDate: string
  search: Partial<Record<ReportSearchKey, string>>
}

function formatIsoDate(value?: string) {
  if (!value) return ''
  const [year, month, day] = value.slice(0, 10).split('-')
  if (!day || !month || !year) return value
  return `${day}/${month}/${year}`
}

function columnMeta<T>(column: { columnDef: ColumnDef<T, unknown> }) {
  return (column.columnDef.meta as { numeric?: boolean; wrap?: boolean } | undefined) ?? {}
}

export function OperationalReportScreen<T>({
  title,
  path,
  columns,
}: OperationalReportScreenProps<T>) {
  const report = findReport(path)
  const heading = report?.title ?? title
  const filter: ReportFilter = report?.filter ?? 'month'
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [fromDate, setFromDate] = useState(isoDate(new Date(now.getFullYear(), now.getMonth(), 1)))
  const [toDate, setToDate] = useState(isoDate(now))
  const [search, setSearch] = useState<Partial<Record<ReportSearchKey, string>>>({})
  const [stockDetail, setStockDetail] = useState<StockLedgerRow | null>(null)
  const [searchId, setSearchId] = useState(0)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const searchFields = report?.search ?? []
  const filtersRef = useRef<ReportFilters>({ month, year, fromDate, toDate, search: {} })
  const { toast } = useToast()
  const { mutateAsync, data, isPending } = useOperationalReport<T>(path)
  const { mutate: createExportJob, isPending: exporting } = useCreateReportExportJob()

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 8 }, (_, index) => current - 5 + index)
  }, [])

  const textFilters = useCallback((values: Partial<Record<ReportSearchKey, string>>) => {
    const result: Partial<Record<ReportSearchKey, string>> = {}
    for (const field of searchFields) {
      const value = values[field.key]?.trim()
      if (value) result[field.key] = value
    }
    return result
  }, [searchFields])

  const buildQuery = useCallback((filters: ReportFilters, page?: number, limit?: number): OperationalReportQuery | null => {
    const text = textFilters(filters.search)
    if (filter === 'range') {
      if (!filters.fromDate || !filters.toDate || filters.toDate < filters.fromDate) return null
      return { fromDate: filters.fromDate, toDate: filters.toDate, ...text, page, limit }
    }
    if (filter === 'none') return { ...text, page, limit }
    return { month: filters.month, year: filters.year, ...text, page, limit }
  }, [filter, textFilters])

  const queryList = useCallback(
    async (req?: IRequestPaginationAndSearch) => {
      const query = buildQuery(filtersRef.current, req?.page ?? 0, req?.limit ?? 20)
      if (!query) return
      await mutateAsync(query)
    },
    [buildQuery, mutateAsync],
  )

  useEffect(() => {
    void queryList({ page: pagination.pageIndex, limit: pagination.pageSize })
  }, [pagination.pageIndex, pagination.pageSize, queryList, searchId])

  const viewReport = useCallback(() => {
    if (filter === 'range' && (!fromDate || !toDate || toDate < fromDate)) {
      toast({
        variant: 'destructive',
        title: 'Khoảng ngày chưa hợp lệ',
        description: 'Đến ngày phải cùng ngày hoặc sau từ ngày.',
      })
      return
    }
    filtersRef.current = { month, year, fromDate, toDate, search }
    if (pagination.pageIndex !== 0) {
      setPagination((current) => ({ ...current, pageIndex: 0 }))
      return
    }
    setSearchId((current) => current + 1)
  }, [filter, fromDate, month, pagination.pageIndex, search, toDate, toast, year])

  const exportReport = useCallback(() => {
    if (!report) return
    if (filter === 'range' && (!fromDate || !toDate || toDate < fromDate)) {
      toast({
        variant: 'destructive',
        title: 'Khoảng ngày chưa hợp lệ',
        description: 'Đến ngày phải cùng ngày hoặc sau từ ngày.',
      })
      return
    }
    const filters: Record<string, string> = { ...textFilters(search) }
    if (filter === 'month') {
      filters.month = String(month)
      filters.year = String(year)
    }
    createExportJob({
      type: report.exportType,
      fromDate: filter === 'range' ? fromDate : undefined,
      toDate: filter === 'range' ? toDate : undefined,
      filters: Object.keys(filters).length ? filters : undefined,
    })
  }, [createExportJob, filter, fromDate, month, report, search, textFilters, toDate, toast, year])

  const page = data?.data
  const total = page?.pagination?.total ?? 0
  const pageCount = pagination.pageSize === 0 ? 0 : Math.ceil(total / pagination.pageSize)
  const rows = page?.data ?? []

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,
    state: { pagination },
    meta: { openStockDetail: setStockDetail },
  })

  const wide = columns.length > 10

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <Link
          to="/report"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Tất cả báo cáo
        </Link>
        <div className="mt-3">
          <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
          {report?.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{report.description}</p>
          ) : null}
        </div>
        <form
          className="mt-4 space-y-3 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            viewReport()
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bộ lọc</div>
          <div className="flex flex-wrap items-end gap-3">
            {filter === 'month' ? (
              <>
                <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium text-muted-foreground">
                  Tháng
                  <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                    <SelectTrigger className="h-9 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          Tháng {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <label className="flex w-[110px] flex-col gap-1 text-xs font-medium text-muted-foreground">
                  Năm
                  <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                    <SelectTrigger className="h-9 rounded-xl bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </>
            ) : null}
            {filter === 'range' ? (
              <>
                <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                  Từ ngày
                  <Input
                    type="date"
                    className="h-9 w-[160px] rounded-xl bg-background"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                  Đến ngày
                  <Input
                    type="date"
                    className="h-9 w-[160px] rounded-xl bg-background"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </label>
              </>
            ) : null}
            {searchFields.map((field) => (
              <label key={field.key} className="flex w-[200px] flex-col gap-1 text-xs font-medium text-muted-foreground">
                {field.label}
                <Input
                  className="h-9 rounded-xl bg-background"
                  placeholder={field.label}
                  value={search[field.key] ?? ''}
                  onChange={(event) => setSearch((current) => ({ ...current, [field.key]: event.target.value }))}
                />
              </label>
            ))}
            {filter !== 'none' || searchFields.length > 0 ? (
              <Button type="submit" size="sm" className="h-9 rounded-xl" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Xem báo cáo
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 rounded-xl"
              onClick={exportReport}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Đang tạo...' : 'Xuất Excel'}
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            {filter === 'none' ? (
              <span className="font-medium text-foreground">Toàn bộ dữ liệu</span>
            ) : page?.fromDate && page?.toDate ? (
              <>
                Kỳ{' '}
                <span className="font-medium text-foreground">
                  {formatIsoDate(page.fromDate)} – {formatIsoDate(page.toDate)}
                </span>
              </>
            ) : (
              'Đang tải số liệu'
            )}
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{total}</span> dòng
            {wide ? <span className="ml-3 hidden sm:inline">Kéo ngang để xem hết cột</span> : null}
          </div>
        </div>

        <Table wrapperClassName="h-[calc(100vh-320px)] max-h-[calc(100vh-320px)]">
          <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const numeric = columnMeta(header.column).numeric
                  const stt = header.column.id === 'stt'
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'whitespace-nowrap bg-muted/95 text-xs font-semibold uppercase tracking-wide',
                        numeric && 'text-right',
                        stt && 'w-14 text-center',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={isPending && rows.length > 0 ? 'opacity-60' : undefined}>
            {isPending && rows.length === 0 ? (
              Array.from({ length: 6 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={columns.length}>
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = columnMeta(cell.column)
                    const stt = cell.column.id === 'stt'
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          meta.wrap ? 'whitespace-normal align-top' : 'whitespace-nowrap',
                          meta.numeric && 'text-right tabular-nums',
                          stt && 'text-center text-muted-foreground',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-36 text-center">
                  <div className="text-sm font-medium">
                    {filter === 'none' ? 'Không có dữ liệu' : 'Không có dữ liệu trong kỳ này'}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {filter === 'range'
                      ? 'Chọn khoảng ngày khác rồi xem lại báo cáo.'
                      : filter === 'month'
                        ? 'Chọn tháng khác rồi xem lại báo cáo.'
                        : 'Chưa có dòng nào để hiển thị.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Hiển thị
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => setPagination({ pageIndex: 0, pageSize: Number(value) })}
            >
              <SelectTrigger className="h-8 w-[76px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            dòng
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Trước
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-sm text-muted-foreground">
                  {pageCount === 0 ? 0 : pagination.pageIndex + 1} / {pageCount}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Sau
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <StockDetailDialog product={stockDetail} onClose={() => setStockDetail(null)} />
    </div>
  )
}
