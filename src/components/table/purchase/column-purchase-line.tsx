import FindVendor from "@/components/modal/vendor/find"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumberVN } from "@/lib/other"
import { IPurchaseOrderLineCreateRequest } from "@/types/purchase"
import { IVendorResponse } from "@/types/vendor"
import { ColumnDef } from "@tanstack/react-table"
import { Copy, Trash2 } from "lucide-react"

const CURRENCY_OPTIONS = ['VND', 'USD', 'EUR', 'CNY']

const CURRENCY_STYLES: Record<string, string> = {
    VND: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    USD: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    EUR: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    CNY: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

export type IPurchaseLineExtends = IPurchaseOrderLineCreateRequest & {
    clientLineId: string
    index: number
    onDelete: () => void
    onDuplicate: () => void
    onUpdate: (field: string, value: unknown) => void
    onSelectVendor: (vendor: IVendorResponse) => void
}

export const PurchaseLineColumns: ColumnDef<IPurchaseLineExtends>[] = [
    {
        id: 'No.',
        header: 'No.',
        cell: (a) => {
            const numb = (a.row.index + 1) + (a.table.getState().pagination.pageIndex * a.table.getState().pagination.pageSize)
            return <div className="text-xs">{numb}</div>
        }
    },
    {
        id: 'Mã hàng',
        accessorKey: 'product',
        header: 'Mã hàng',
        cell: ({ row }) => (
            <div className="text-xs font-medium">{row.original?.product?.code ?? '—'}</div>
        ),
    },
    {
        id: 'Tên hàng',
        header: 'Tên hàng',
        cell: ({ row }) => (
            <div className="text-xs max-w-[180px] truncate" title={row.original?.product?.name}>
                {row.original?.product?.name ?? '—'}
            </div>
        ),
    },
    {
        id: 'Nhà cung cấp',
        header: 'Nhà cung cấp',
        cell: ({ row }) => (
            <div className="flex max-w-[220px] flex-col gap-1">
                <div className="text-xs truncate" title={row.original?.vendor?.name}>
                    <span className="font-medium">{row.original?.vendor?.code ?? '—'}</span>
                    {row.original?.vendor?.name ? ` · ${row.original.vendor.name}` : ''}
                </div>
                <FindVendor
                    triggerLabel="Đổi NCC"
                    onSelect={row.original.onSelectVendor}
                />
            </div>
        ),
    },
    {
        id: 'SL mua',
        accessorKey: 'quantity',
        header: 'SL mua',
        cell: ({ row }) => (
            <Input
                key={`qty-${row.original.clientLineId}`}
                className="text-xs h-7 w-[70px]"
                type="number"
                min={1}
                defaultValue={row.original?.quantity}
                onBlur={(e) => row.original.onUpdate('quantity', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'ĐVT',
        header: 'ĐVT',
        cell: ({ row }) => (
            <Input
                key={`uom-${row.original.clientLineId}`}
                className="text-xs h-7 w-[70px]"
                defaultValue={row.original?.uom1 ?? row.original?.product?.unit1 ?? ''}
                onBlur={(e) => row.original.onUpdate('uom1', e.target.value)}
            />
        ),
    },
    {
        id: 'Tiền tệ',
        header: 'Tiền tệ',
        cell: ({ row }) => {
            const curr = row.original?.currency ?? 'VND'
            return (
                <Select
                    key={`currency-${row.original.clientLineId}`}
                    defaultValue={curr}
                    onValueChange={(v) => row.original.onUpdate('currency', v)}
                >
                    <SelectTrigger className={`h-7 w-[76px] text-xs border font-medium ${CURRENCY_STYLES[curr] ?? ''}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CURRENCY_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
    },
    {
        id: 'Tỷ giá',
        header: 'Tỷ giá',
        cell: ({ row }) => (
            <Input
                key={`rate-${row.original.clientLineId}`}
                className="text-xs h-7 w-[90px]"
                type="number"
                min={0}
                step={100}
                defaultValue={row.original?.exchangeRate ?? 1}
                onBlur={(e) => row.original.onUpdate('exchangeRate', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'Đơn giá mua',
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => (
            <Input
                key={`price-${row.original.clientLineId}`}
                className="text-xs h-7 w-[100px]"
                type="number"
                min={0}
                step={100}
                defaultValue={row.original?.unitPrice}
                onBlur={(e) => row.original.onUpdate('unitPrice', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'Thuế (%)',
        header: 'Thuế (%)',
        cell: ({ row }) => (
            <Input
                key={`tax-${row.original.clientLineId}`}
                className="text-xs h-7 w-[60px]"
                type="number"
                min={0}
                max={100}
                defaultValue={row.original?.tax ?? 0}
                onBlur={(e) => row.original.onUpdate('tax', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'Quote',
        header: 'Quote',
        cell: ({ row }) => (
            <Input
                key={`quote-${row.original.clientLineId}`}
                className="text-xs h-7 w-[120px]"
                defaultValue={row.original?.quote ?? ''}
                placeholder="Quote"
                onBlur={(e) => row.original.onUpdate('quote', e.target.value)}
            />
        ),
    },
    {
        id: 'Invoice',
        header: 'Invoice',
        cell: ({ row }) => (
            <Input
                key={`invoice-${row.original.clientLineId}`}
                className="text-xs h-7 w-[120px]"
                defaultValue={row.original?.invoice ?? ''}
                placeholder="Invoice"
                onBlur={(e) => row.original.onUpdate('invoice', e.target.value)}
            />
        ),
    },
    {
        id: 'Receipt WH',
        header: 'Receipt WH',
        cell: ({ row }) => (
            <Input
                key={`receipt-${row.original.clientLineId}`}
                className="text-xs h-7 w-[140px]"
                defaultValue={row.original?.receiptWarehouse ?? ''}
                placeholder="Receipt WH"
                onBlur={(e) => row.original.onUpdate('receiptWarehouse', e.target.value)}
            />
        ),
    },
    {
        id: 'B/L',
        header: 'B/L',
        cell: ({ row }) => (
            <Input
                key={`bol-${row.original.clientLineId}`}
                className="text-xs h-7 w-[140px]"
                defaultValue={row.original?.billOfLadding ?? ''}
                placeholder="Bill of lading"
                onBlur={(e) => row.original.onUpdate('billOfLadding', e.target.value)}
            />
        ),
    },
    {
        id: 'Track ID',
        header: 'Track ID',
        cell: ({ row }) => (
            <Input
                key={`track-${row.original.clientLineId}`}
                className="text-xs h-7 w-[130px]"
                defaultValue={row.original?.trackId ?? ''}
                placeholder="Track ID"
                onBlur={(e) => row.original.onUpdate('trackId', e.target.value)}
            />
        ),
    },
    {
        id: 'Thành tiền',
        header: 'Thành tiền',
        cell: ({ row }) => {
            const total = (row.original?.quantity ?? 0) * (row.original?.unitPrice ?? 0)
            const curr = row.original?.currency ?? 'VND'
            const rate = row.original?.exchangeRate ?? 1
            const totalVnd = curr === 'VND' ? total : total * rate
            return (
                <div className="flex flex-col gap-0.5 min-w-[110px]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold tabular-nums">{formatNumberVN(total)}</span>
                        <Badge
                            variant="outline"
                            className={`text-[9px] px-1 py-0 h-4 leading-none border ${CURRENCY_STYLES[curr] ?? ''}`}
                        >
                            {curr}
                        </Badge>
                    </div>
                    {curr !== 'VND' && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                            ≈ {formatNumberVN(totalVnd)} VND
                        </span>
                    )}
                </div>
            )
        },
    },
    {
        id: 'Ghi chú',
        header: 'Ghi chú',
        cell: ({ row }) => (
            <Input
                key={`note-${row.original.clientLineId}`}
                className="text-xs h-7 w-[110px]"
                defaultValue={row.original?.note ?? ''}
                placeholder="Ghi chú"
                onBlur={(e) => row.original.onUpdate('note', e.target.value)}
            />
        ),
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <div className="flex items-center gap-0.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Nhân dòng — cùng mã hàng, mua thêm từ NCC khác"
                    onClick={row.original.onDuplicate}
                >
                    <Copy className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Xóa dòng"
                    onClick={row.original.onDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
]
