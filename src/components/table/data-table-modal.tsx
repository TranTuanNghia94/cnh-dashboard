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
import { IPaginationAndSearch } from "@/types/api"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    total?: number,
    fetchData: (req: IPaginationAndSearch<unknown>) => void,
    selectedFunct?: (item: TData) => void,
}


export function DataTableModal<TData, TValue>({
    columns,
    data,
    fetchData,
    selectedFunct,
    total = 0
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

    const handleSelect = (item: TData) => {
        setSelected(item);
        selectedFunct?.(item);
    };

    useEffect(() => {
        fetchData({
            take: pagination.pageSize,
            skip: (pagination.pageIndex * pagination.pageSize)
        })
    }, [pagination.pageIndex, pagination.pageSize])

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
    })

    return (
        <div>

            <div>
                <Table>
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

                                    <TableCell>
                                        <RadioGroup
                                            onClick={() => handleSelect(row.original)}
                                        >
                                            <RadioGroupItem checked={selected === row.original} value={(row.original as { code: string })?.code || ""} />
                                        </RadioGroup>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </div>


            <div className="flex items-center justify-between space-x-2 py-4 px-4">
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

                            <PaginationItem>
                                <PaginationLink onClick={() => table.setPageIndex(0)} isActive={table.getState().pagination.pageIndex === 0}>
                                    1
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationLink onClick={() => table.setPageIndex(1)} isActive={table.getState().pagination.pageIndex === 1}>
                                    2
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationLink onClick={() => table.setPageIndex(2)} isActive={table.getState().pagination.pageIndex === 2}>
                                    3
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
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
        </div >
    )
}