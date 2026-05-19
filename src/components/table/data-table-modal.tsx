import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "../ui/button"
import React, { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "../ui/pagination"
import { IRequestPaginationAndSearch } from "@/types/api"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"


const DEFAULT_TABLE_WRAPPER_CLASS =
    'h-[min(420px,calc(92vh-300px))] max-h-[min(420px,calc(92vh-300px))]'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    total?: number,
    fetchData: (req: IRequestPaginationAndSearch) => void,
    selectedFunct?: (item: TData) => void,
    onDoubleClickConfirm?: (item: TData) => void,
    tableWrapperClassName?: string
    className?: string
    emptyText?: string
}


export function DataTableModal<TData, TValue>({
    columns,
    data,
    fetchData,
    selectedFunct,
    onDoubleClickConfirm,
    total = 0,
    tableWrapperClassName = DEFAULT_TABLE_WRAPPER_CLASS,
    className,
    emptyText = 'Không có dữ liệu.',
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [selected, setSelected] = React.useState<TData>();
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const fetchDataRef = React.useRef(fetchData)

    useEffect(() => {
        fetchDataRef.current = fetchData
    }, [fetchData])

    const handleSelect = (item: TData) => {
        setSelected(item);
        selectedFunct?.(item);
    };

    useEffect(() => {
        fetchDataRef.current({
            limit: pagination.pageSize,
            page: pagination.pageIndex 
        })
        
    }, [pagination.pageIndex, pagination.pageSize])

    const pageCount = Math.ceil(total / pagination.pageSize)

    const generatePaginationItems = () => {
        const currentPage = pagination.pageIndex
        const items: (number | 'ellipsis')[] = []

        if (pageCount <= 0) {
            return items
        }

        if (pageCount <= 7) {
            for (let i = 0; i < pageCount; i++) {
                items.push(i)
            }
        } else {
            items.push(0)

            if (currentPage > 2) {
                items.push('ellipsis')
            }

            const start = Math.max(1, currentPage - 1)
            const end = Math.min(pageCount - 2, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!items.includes(i)) {
                    items.push(i)
                }
            }

            if (currentPage < pageCount - 3) {
                items.push('ellipsis')
            }

            if (!items.includes(pageCount - 1)) {
                items.push(pageCount - 1)
            }
        }

        return items
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
    })

    const getRowKey = (item: TData) => {
        const record = item as { id?: string; code?: string }
        return record.id ?? record.code ?? ''
    }

    return (
        <div className={cn('flex min-h-0 flex-1 flex-col', className)}>

            <div className="min-h-0 flex-1">
                <Table wrapperClassName={tableWrapperClassName}>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                                <TableHead className="w-12 text-center">Chọn</TableHead>
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="z-0">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => {
                                const rowKey = getRowKey(row.original)
                                const isSelected = selected === row.original
                                return (
                                <TableRow
                                    key={row.id}
                                    data-state={isSelected && 'selected'}
                                    className="cursor-pointer"
                                    onClick={() => handleSelect(row.original)}
                                    onDoubleClick={() => onDoubleClickConfirm?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}

                                    <TableCell className="w-12 text-center">
                                        <RadioGroup onClick={() => handleSelect(row.original)}>
                                            <RadioGroupItem
                                                checked={isSelected}
                                                value={rowKey}
                                                aria-label="Chọn dòng"
                                            />
                                        </RadioGroup>
                                    </TableCell>
                                </TableRow>
                            )})
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    {emptyText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </div>


            <div className="flex shrink-0 items-center justify-between gap-2 border-t py-3">
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled>
                        Total: {total}
                    </Button>

                    <Select onValueChange={(e) => table.setPageSize(Number(e))}>
                        <SelectTrigger id="framework" className="w-[80px]">
                            <SelectValue placeholder={pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value={"10"}>10</SelectItem>
                            <SelectItem value={"20"}>20</SelectItem>
                            <SelectItem value={"30"}>30</SelectItem>
                            <SelectItem value={"50"}>50</SelectItem>
                            <SelectItem value={"100"}>100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    ←
                                </Button>
                            </PaginationItem>

                            {generatePaginationItems().map((item, index) => (
                                <PaginationItem key={index}>
                                    {item === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            onClick={() => table.setPageIndex(item)}
                                            isActive={pagination.pageIndex === item}
                                        >
                                            {item + 1}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
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
        </div>
    )
}