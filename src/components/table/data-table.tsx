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
// import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ChevronDown } from "lucide-react"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "../ui/pagination"
import { IRequestPaginationAndSearch } from "@/types/api"
import { Separator } from "../ui/separator"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    total?: number,
    title?: string,
    fetchData: (req: IRequestPaginationAndSearch) => void
    listTools?: React.ReactNode
}


export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    fetchData,
    listTools,
    total = 0
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        fetchData({
            limit: pagination.pageSize,
            page: (pagination.pageIndex * pagination.pageSize)
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
            <div className="flex justify-between item-center">
                <div className="font-bold text-center">{title}</div>

                <div>
                    <div className="flex gap-x-2">
                        {/* <Input
                            placeholder="Filter emails..."
                            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("email")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        /> */}
                        {listTools}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="ml-auto">
                                    Columns <ChevronDown size={18} />
                                </Button>

                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter(
                                        (column) => column.getCanHide()
                                    )
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            
            <Separator className="my-2 bg-secondary-foreground" />

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
        </div>
    )
}