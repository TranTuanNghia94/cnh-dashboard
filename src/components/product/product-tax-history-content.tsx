import { ProductTaxHistoryColumns } from '@/components/table/product/tax-history-columns'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
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
import { useGetProductTaxHistory } from '@/hooks/use-product'
import {
  parseProductTaxHistoryResponse,
  productTaxHistoryErrorMessage,
} from '@/lib/product-tax-history'
import type { IProductTaxHistoryItem } from '@/types/product-tax-history'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type ProductTaxHistoryContentProps = {
  productId: string
  enabled?: boolean
}

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const

export default function ProductTaxHistoryContent({ productId, enabled = true }: ProductTaxHistoryContentProps) {
  const { mutateAsync } = useGetProductTaxHistory()
  const mutateRef = useRef(mutateAsync)
  mutateRef.current = mutateAsync

  const requestSeqRef = useRef(0)

  const [rows, setRows] = useState<IProductTaxHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  useEffect(() => {
    if (!productId || !enabled) {
      setStatus('idle')
      setRows([])
      setTotal(0)
      setErrorMessage(null)
      return
    }

    const seq = ++requestSeqRef.current
    setStatus('loading')
    setErrorMessage(null)

    void (async () => {
      try {
        const response = await mutateRef.current({
          productId,
          page: pagination.pageIndex,
          limit: pagination.pageSize,
        })
        if (seq !== requestSeqRef.current) return

        const parsed = parseProductTaxHistoryResponse(response)
        setRows(parsed.rows)
        setTotal(parsed.total)
        setStatus('ready')
      } catch (error) {
        if (seq !== requestSeqRef.current) return
        setRows([])
        setTotal(0)
        setStatus('error')
        setErrorMessage(productTaxHistoryErrorMessage(error))
      }
    })()
  }, [productId, enabled, pagination.pageIndex, pagination.pageSize])

  const pageCount = total > 0 ? Math.ceil(total / pagination.pageSize) : 0

  const table = useReactTable({
    data: rows,
    columns: ProductTaxHistoryColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange: setPagination,
  })

  if (!enabled) {
    return null
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p className="py-10 text-center text-sm text-destructive">
        {errorMessage ?? 'Không tải được lịch sử thuế'}
      </p>
    )
  }

  if (total === 0 && rows.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Chưa có thay đổi thuế</p>
  }

  return (
    <div className="space-y-2">
      <div className="w-full overflow-x-auto rounded-md border">
        <Table wrapperClassName="h-auto min-h-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-8 text-xs">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={ProductTaxHistoryColumns.length} className="h-20 text-center text-sm">
                  Không có dữ liệu trên trang này
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="h-8 text-xs">
            Tổng: {total}
          </Button>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              setPagination({ pageIndex: 0, pageSize: Number(value) })
            }}
          >
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ←
              </Button>
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => table.setPageIndex(i)}
                  isActive={pagination.pageIndex === i}
                  className="h-8 w-8 cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                →
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
