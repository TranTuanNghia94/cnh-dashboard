import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
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
    isLoading?: boolean
    emptyText?: string
}

function columnLabel<TData, TValue>(column: { id: string; columnDef: ColumnDef<TData, TValue> }) {
    const header = column.columnDef.header
    if (typeof header === "string" && header.trim()) return header
    if (column.id === "actions" || column.id === "select") return "Thao tác"
    return column.id
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    fetchData,
    listTools,
    total = 0,
    isLoading = false,
    emptyText = "Không có dữ liệu.",
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        fetchData({
            limit: pagination.pageSize,
            page: pagination.pageIndex
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageIndex, pagination.pageSize])

    const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize) || 1)
    const safePageCount = total === 0 ? 0 : pageCount

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        manualPagination: true,
        manualSorting: true,
        pageCount: safePageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
    })

    const generatePaginationItems = () => {
        const currentPage = pagination.pageIndex
        const items: (number | 'ellipsis')[] = []
        const count = safePageCount

        if (count <= 0) return items

        if (count <= 7) {
            for (let i = 0; i < count; i++) {
                items.push(i)
            }
        } else {
            items.push(0)

            if (currentPage > 2) {
                items.push('ellipsis')
            }

            const start = Math.max(1, currentPage - 1)
            const end = Math.min(count - 2, currentPage + 1)

            for (let i = start; i <= end; i++) {
                if (!items.includes(i)) {
                    items.push(i)
                }
            }

            if (currentPage < count - 3) {
                items.push('ellipsis')
            }

            if (!items.includes(count - 1)) {
                items.push(count - 1)
            }
        }

        return items
    }

    return (
        <div>
            <div className="flex justify-between item-center">
                <div className="font-bold text-center">{title}</div>

                <div>
                    <div className="flex gap-x-2">
                        {listTools}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="ml-auto">
                                    Cột <ChevronDown size={18} />
                                </Button>

                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {columnLabel(column)}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            
            <Separator className="my-2 bg-secondary-foreground" />

            <div className="w-full overflow-x-auto">
                <div className="min-w-0">
                    <Table className="w-full whitespace-nowrap" wrapperClassName="h-[calc(95vh-200px)] max-h-[calc(95vh-200px)]">
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
                                    {isLoading ? "Đang tải…" : emptyText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
            </div>


            <div className="flex items-center justify-between space-x-2 py-4 px-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" disabled>
                        Tổng: {total}
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
                                            onClick={() => table.setPageIndex(item )}
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
