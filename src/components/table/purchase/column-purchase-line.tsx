import FindVendor from "@/components/modal/vendor/find"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumberVN, formatPurchaseLineAmount } from "@/lib/other"
import { IPurchaseOrderLineCreateRequest } from "@/types/purchase"
import { IProductResponse } from "@/types/product"
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
    product?: IProductResponse
    vendor?: IVendorResponse
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
                className="text-xs h-7 w-[70px]"
                type="number"
                min={1}
                value={row.original?.quantity ?? 0}
                onChange={(e) => row.original.onUpdate('quantity', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'ĐVT',
        header: 'ĐVT',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[70px]"
                value={row.original?.uom1 ?? row.original?.product?.unit1 ?? ''}
                onChange={(e) => row.original.onUpdate('uom1', e.target.value)}
            />
        ),
    },
    {
        id: 'Tiền tệ',
        header: 'Tiền tệ',
        cell: ({ row }) => {
            const curr = (row.original?.currency ?? 'VND').toUpperCase()
            return (
                <Select
                    value={curr}
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
        cell: ({ row }) => {
            const rate = row.original?.exchangeRate ?? 1
            const isVnd = (row.original?.currency ?? 'VND').toUpperCase() === 'VND'
            return (
                <Input
                    className="text-xs h-7 w-[90px]"
                    type="number"
                    min={0}
                    step={isVnd ? 1 : 0.01}
                    value={Number.isFinite(Number(rate)) ? Number(rate) : 1}
                    disabled={isVnd}
                    onChange={(e) =>
                        row.original.onUpdate('exchangeRate', Number(e.target.value))
                    }
                />
            )
        },
    },
    {
        id: 'Đơn giá mua',
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[100px]"
                type="number"
                min={0}
                step="any"
                value={row.original?.unitPrice ?? 0}
                onChange={(e) => row.original.onUpdate('unitPrice', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'Thuế (%)',
        header: 'Thuế (%)',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[60px]"
                type="number"
                min={0}
                max={100}
                value={row.original?.tax ?? 0}
                onChange={(e) => row.original.onUpdate('tax', Number(e.target.value))}
            />
        ),
    },
    {
        id: 'Quote',
        header: 'Quote',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[120px]"
                value={row.original?.quote ?? ''}
                placeholder="Quote"
                onChange={(e) => row.original.onUpdate('quote', e.target.value)}
            />
        ),
    },
    {
        id: 'Invoice',
        header: 'Invoice',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[120px]"
                value={row.original?.invoice ?? ''}
                placeholder="Invoice"
                onChange={(e) => row.original.onUpdate('invoice', e.target.value)}
            />
        ),
    },
    {
        id: 'Receipt WH',
        header: 'Receipt WH',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[140px]"
                value={row.original?.receiptWarehouse ?? ''}
                placeholder="Receipt WH"
                onChange={(e) => row.original.onUpdate('receiptWarehouse', e.target.value)}
            />
        ),
    },
    {
        id: 'B/L',
        header: 'B/L',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[140px]"
                value={row.original?.billOfLadding ?? ''}
                placeholder="Bill of lading"
                onChange={(e) => row.original.onUpdate('billOfLadding', e.target.value)}
            />
        ),
    },
    {
        id: 'Track ID',
        header: 'Track ID',
        cell: ({ row }) => (
            <Input
                className="text-xs h-7 w-[130px]"
                value={row.original?.trackId ?? ''}
                placeholder="Track ID"
                onChange={(e) => row.original.onUpdate('trackId', e.target.value)}
            />
        ),
    },
    {
        id: 'Thành tiền',
        header: 'Thành tiền',
        cell: ({ row }) => {
            const curr = (row.original?.currency ?? 'VND').toUpperCase()
            const total =
                row.original?.totalPrice ??
                (row.original?.quantity ?? 0) * (row.original?.unitPrice ?? 0)
            const totalVnd =
                row.original?.totalPriceVnd ??
                (curr === 'VND' ? total : total * (row.original?.exchangeRate ?? 1))
            return (
                <div className="flex flex-col gap-0.5 min-w-[110px]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold tabular-nums">
                            {formatPurchaseLineAmount(total, curr)}
                        </span>
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
                className="text-xs h-7 w-[110px]"
                value={row.original?.note ?? ''}
                placeholder="Ghi chú"
                onChange={(e) => row.original.onUpdate('note', e.target.value)}
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
