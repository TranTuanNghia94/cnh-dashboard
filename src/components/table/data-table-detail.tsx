import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "../ui/button"
import React, { useEffect, useMemo, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "../ui/pagination"
import { Separator } from "../ui/separator"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    listTools?: React.ReactNode,
    wrapperClassName?: string,
    className?: string,
    noDataText?: string | null,
    rowSelect?: (rowSelection: Record<string, boolean>) => void
    /** Ổn định key khi có nhiều dòng cùng mã hàng / khác NCC */
    getRowId?: (row: TData) => string
    /** Summary row pinned under the lines, e.g. quantity and line amount totals. */
    tableFooter?: React.ReactNode
    /** Extra totals shown beside the row count. */
    summary?: React.ReactNode
    /** Changing this value returns the table to the first page. */
    resetPageToken?: string
}

interface ColumnFilter {
    id: string
    value: unknown
}
type ColumnFiltersState = ColumnFilter[]

const emptyArray: unknown[] = []

export function DataTableDetail<TData, TValue>({
    columns,
    data,
    listTools,
    wrapperClassName,
    noDataText,
    className,
    rowSelect,
    getRowId,
    tableFooter,
    summary,
    resetPageToken,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const tableData = useMemo(() => data ?? [], [data]);
    const tableColumns = useMemo(() => columns ?? [], [columns]);


    useEffect(() => {
        if (rowSelect) {
            rowSelect(rowSelection)
        }
    }, [rowSelection, rowSelect])

    const table = useReactTable({
        data: tableData ?? emptyArray,
        columns: tableColumns ?? emptyArray,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        autoResetPageIndex: false,
        autoResetExpanded: false,
        ...(getRowId ? { getRowId: (row: TData) => getRowId(row) } : {}),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection
        },
    })

    const tableRef = useRef(table)
    tableRef.current = table

    useEffect(() => {
        if (resetPageToken === undefined) return
        tableRef.current.setPageIndex(0)
    }, [resetPageToken])

    const pageSize = table.getState().pagination.pageSize || 10
    const pageIndex = table.getState().pagination.pageIndex
    const pageCount = Math.max(1, Math.ceil((tableData?.length || 0) / pageSize))
    const safePageCount = (tableData?.length || 0) === 0 ? 0 : pageCount

    const generatePaginationItems = () => {
        const items: (number | 'ellipsis')[] = []
        const count = safePageCount
        if (count <= 0) return items

        if (count <= 7) {
            for (let i = 0; i < count; i++) items.push(i)
            return items
        }

        items.push(0)
        if (pageIndex > 2) items.push('ellipsis')
        const start = Math.max(1, pageIndex - 1)
        const end = Math.min(count - 2, pageIndex + 1)
        for (let i = start; i <= end; i++) {
            if (!items.includes(i)) items.push(i)
        }
        if (pageIndex < count - 3) items.push('ellipsis')
        if (!items.includes(count - 1)) items.push(count - 1)
        return items
    }

    return (
        <div>
            <div>
                <div>
                    <div>
                        <div className="flex gap-x-2 justify-between">
                            <div className="gap-x-2 flex">
                                {listTools}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-2 bg-secondary-foreground" />

            <div>
                <Table wrapperClassName={wrapperClassName} className={className}>
                    <TableHeader className="sticky top-0 bg-background">
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
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="z-0">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                   {noDataText ?? "Không có dữ liệu."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {tableFooter && table.getRowModel().rows?.length ? (
                        <TableFooter className="bg-background">
                            {tableFooter}
                        </TableFooter>
                    ) : null}
                </Table>
            </div>


            <div className="flex items-center justify-between space-x-2 py-4 px-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled>
                        Tổng: {data?.length ?? 0}
                    </Button>
                    {summary}

                    <Select onValueChange={(e) => table.setPageSize(Number(e))}>
                        <SelectTrigger id="framework" className="w-[80px]">
                            <SelectValue placeholder={pageSize} />
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
                                            isActive={pageIndex === item}
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
