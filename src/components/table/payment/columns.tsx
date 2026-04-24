import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PaymentRowActions from "@/components/table/payment/payment-row-actions"
import { formatCurrencyVN } from "@/lib/other"
import { IPaymentRequestInfo } from "@/types/payment"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import moment from 'moment'
import { PAYMENT_REQUEST_STATUS_PAID, PAYMENT_REQUEST_STATUS_REJECTED, PAYMENT_REQUEST_STATUS_STYLES } from '@/lib/constants'

const DEFAULT_STATUS_STYLE = {
    label: 'Không xác định',
    style: 'text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center shadow-md',
};

const renderStatus = (item: IPaymentRequestInfo) => {
    if (item?.approvals?.some((val) => val.status === PAYMENT_REQUEST_STATUS_REJECTED) || item.status === PAYMENT_REQUEST_STATUS_REJECTED) {
        const rejectedStyle = PAYMENT_REQUEST_STATUS_STYLES[PAYMENT_REQUEST_STATUS_REJECTED] ?? DEFAULT_STATUS_STYLE;
        return (
            <div className={rejectedStyle.style}>
                {rejectedStyle.label}
            </div>
        );
    }
    const statusStyle = PAYMENT_REQUEST_STATUS_STYLES[item.status] ?? DEFAULT_STATUS_STYLE;
    return (
        <div className={statusStyle.style}>
            {statusStyle.label}
        </div>
    );
};




export const PaymentColumns: ColumnDef<IPaymentRequestInfo>[] = [
    {
        id: 'No.',
        header: 'No.',
        accessorKey: 'stt',
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * (a.table.getState().pagination.pageSize))
            return <div className="text-xs">{numb}</div>
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
        cell: ({ row }) => <div className="text-xs">{row.original?.createdBy}</div>

    },
    {
        id: 'Mã DNTT',
        accessorKey: "requestNumber",
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Mã DNTT
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.requestNumber}</div>,
    },
    {
        id: 'Chứng từ',
        accessorKey: 'notes',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Chứng từ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.notes}</div>,
    },
    {
        id: 'Nhà cung cấp',
        accessorKey: 'purpose',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nhà cung cấp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original?.purpose}</div>,
    },
    {
        id: 'Deadline',
        accessorKey: 'dueDate',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Deadline
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{moment(row.original?.requestDate).format('DD/MM/YYYY')}</div>,
    },
    {
        id: 'Tỷ lệ',
        accessorKey: 'paidPercentage',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tỷ lệ
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{row.original.paidPercentage}%</div>,
    },
    {
        id: 'Tổng tiền',
        accessorKey: 'totalAmount',
        header: ({ column }) => {
            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tổng tiền
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs">{formatCurrencyVN(Number(row.original.totalAmountVnd || 0))}</div>,
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
        cell: ({ row }) => {
            if (row.original.status === PAYMENT_REQUEST_STATUS_PAID) {
                return <Badge variant={"success"}>BankNote</Badge>
            }

            return null
        },
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
        cell: ({ row }) => <div className="text-xs">{renderStatus(row.original)}</div>,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => <PaymentRowActions payment={row.original} />,
    }
]