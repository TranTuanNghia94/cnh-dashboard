import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PaymentRowActions from "@/components/table/payment/payment-row-actions"
import { formatCurrencyVN } from "@/lib/other"
import { IPaymentRequestInfo } from "@/types/payment"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import moment from 'moment'
import { PAYMENT_REQUEST_STATUS_APPROVED, PAYMENT_REQUEST_STATUS_CANCELLED, PAYMENT_REQUEST_STATUS_DRAFT, PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL, PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL, PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL, PAYMENT_REQUEST_STATUS_PARTIALLY_PAID, PAYMENT_REQUEST_STATUS_PAID, PAYMENT_REQUEST_STATUS_REJECTED, PAYMENT_REQUEST_STATUS_SUBMITTED } from '@/lib/constants'

const renderStatus = (item: IPaymentRequestInfo) => {
    if (item?.approvals?.some((val) => val.status === PAYMENT_REQUEST_STATUS_REJECTED) || item.status === PAYMENT_REQUEST_STATUS_REJECTED) {
        return <div className='text-red-500 font-bold'>Bị từ chối</div>;
    }
    switch (item.status) {
        case PAYMENT_REQUEST_STATUS_DRAFT:
            return <div className='text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center'>Nháp</div>;
        case PAYMENT_REQUEST_STATUS_SUBMITTED:
            return <div className='text-blue-500 font-bold bg-blue-100 rounded-md px-2 py-1 text-center'>Chờ duyệt</div>;
        case PAYMENT_REQUEST_STATUS_PENDING_ACCOUNTANT_APPROVAL:
            return <div className='text-orange-500 font-bold bg-orange-100 rounded-md px-2 py-1 text-center'>Chờ duyệt 1</div>;
        case PAYMENT_REQUEST_STATUS_PENDING_HEAD_ACCOUNTANT_APPROVAL:
            return <div className='text-orange-500 font-bold bg-orange-100 rounded-md px-2 py-1 text-center'>Chờ duyệt 2</div>;
        case PAYMENT_REQUEST_STATUS_PENDING_FINAL_APPROVAL:
            return <div className='font-bold text-orange-500 bg-orange-100 rounded-md px-2 py-1 text-center'>Xử lý</div>;
        case PAYMENT_REQUEST_STATUS_APPROVED:
            return <div className='text-primary font-bold bg-primary-100 rounded-md px-2 py-1 text-center'>Đã duyệt</div>
        case PAYMENT_REQUEST_STATUS_PARTIALLY_PAID:
        case PAYMENT_REQUEST_STATUS_PAID:
            return <div className='text-green-500 font-bold bg-green-100 rounded-md px-2 py-1 text-center'>Đã thanh toán</div>;
        case PAYMENT_REQUEST_STATUS_REJECTED:
            return <div className='text-red-500 font-bold bg-red-100 rounded-md px-2 py-1 text-center'>Bị từ chối</div>;
        case PAYMENT_REQUEST_STATUS_CANCELLED:
            return <div className='text-gray-500 font-bold bg-gray-100 rounded-md px-2 py-1 text-center'>Đã huỷ</div>;
        default:
            return 'Nháp';
    }
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