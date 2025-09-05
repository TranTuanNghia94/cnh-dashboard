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
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "../ui/button"
import React, { useEffect, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "../ui/pagination"
import { Separator } from "../ui/separator"
import { Input } from "../ui/input"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    listTools?: React.ReactNode,
    wrapperClassName?: string,
    className?: string,
    noDataText?: string | null,
    rowSelect?: (rowSelection: Record<string, boolean>) => void
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
    rowSelect
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
    }, [rowSelection])

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection
        },
    })

    return (
        <div>
            <div>
                <div>
                    <div>
                        <div className="flex gap-x-2 justify-between">
                            <div className="gap-x-2 flex">
                                {listTools}
                            </div>

                            <div className="flex gap-x-2">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    headerGroup.headers.map((header) => {
                                        return header.column.getCanFilter() && (
                                            <Input key={header.id} placeholder={header.column.columnDef.header as string}
                                                value={(table.getColumn(header.id)?.getFilterValue() as string) ?? ""}
                                                onChange={(event) =>
                                                    table.getColumn(header.id)?.setFilterValue(event.target.value)
                                                } />)
                                    })
                                ))}
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
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                   {noDataText ?? "No results."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>


            <div className="flex items-center justify-between space-x-2 py-4 px-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled>
                        Total: {data?.length}
                    </Button>

                    <Select onValueChange={(e) => table.setPageSize(Number(e))}>
                        <SelectTrigger id="framework" className="w-[80px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
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

                            {
                                Array.from({ length: data.length / table.getState().pagination.pageSize }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink onClick={() => table.setPageIndex(i + 1)} isActive={table.getState().pagination.pageIndex === i + 1}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))
                            }

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