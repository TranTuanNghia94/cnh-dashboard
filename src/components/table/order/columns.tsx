import ConfirmDeleteSell from "@/components/modal/order/delete"
import UpdateOrderStatus from "@/components/modal/order/update-status"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/constants"
import { numberWithCommas } from "@/lib/other"
import { cn } from "@/lib/utils"
import { IOrderResponse } from "@/types/order"
import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import moment from "moment"


export type IOrderExtends = IOrderResponse & { refetch: () => void }

export const OrdersColumns: ColumnDef<IOrderExtends>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={row.getToggleSelectedHandler()}
                aria-label="Select row"
            />
        ),
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'No.',
        header: 'No.',
        accessorKey: 'stt',
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs text-center">{numb}</div>
        }

    },
    {
        id: 'Người tạo',
        accessorKey: 'createdBy',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Người tạo
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs text-center">{row.original?.createdBy}</div>

    },
    {
        id: 'Số hợp đồng',
        accessorKey: "contractNumber",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Số hợp đồng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-xs">{row.original.contractNumber}</div>,
    },
    {
        id: 'Mã đơn hàng',
        accessorKey: 'orderNumber',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã đơn hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs text-center">{ row.original.orderPrefix + "." + row.original.orderNumber.toString().padStart(3, '0')}</div>,
    },
    {
        id: 'Khách hàng',
        accessorKey: 'customerName',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Khách hàng
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.customer?.name}</div>,
    },
    {
        id: 'Ngày PO',
        accessorKey: 'orderDate',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ngày PO
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs text-center">{row.original?.orderDate && moment(row.original?.orderDate).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Ngày hoàn thành',
        accessorKey: 'deliveryDate',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ngày hoàn thành
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs text-center">{row.original?.deliveryDate && moment(row.original?.deliveryDate).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Thành tiền',
        accessorKey: 'finalAmount',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Thành tiền
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs text-center">{numberWithCommas(Number(row.original.finalAmount))}</div>,
    },
    {
        id: 'Ghi chú',
        accessorKey: 'notes',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ghi chú
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.notes}</div>,
    },
    {
        id: 'Trạng thái',
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Trạng thái
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.original.status

            return (
                    <div className={cn("text-xs text-center px-3 py-1 rounded-md font-medium shadow-sm", ORDER_STATUS_STYLES[status as keyof typeof ORDER_STATUS_STYLES] || ORDER_STATUS_STYLES.DEFAULT)}>
                        {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status}
                    </div>
            )
        }
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const item = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="bg-transparent">
                        <Button
                            aria-haspopup="true"
                            size="sm"
                            variant="ghost"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         {
                            item.status === 'DRAFT' && (
                                <Link to="/order/$orderId" params={{ orderId: row.original.orderPrefix + "." + row.original.orderNumber.toString().padStart(3, '0') as string }}>
                                    <DropdownMenuItem className="text-blue-600">Cập nhật</DropdownMenuItem>
                                </Link>
                            )
                         }

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <UpdateOrderStatus orderData={item} refetch={item?.refetch} />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {
                            item.status === 'DRAFT' && (
                                <DropdownMenuItem asChild className="text-red-600">
                                    <ConfirmDeleteSell order={item} refetch={item?.refetch} />
                                </DropdownMenuItem>
                            )
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]