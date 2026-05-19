import {
  formatProductTaxChangeDelta,
  formatProductTaxPercent,
  productTaxChangeDelta,
  productTaxSourceLabel,
} from '@/lib/product-tax-history'
import { cn } from '@/lib/utils'
import type { IProductTaxHistoryItem } from '@/types/product-tax-history'
import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'

export const ProductTaxHistoryColumns: ColumnDef<IProductTaxHistoryItem>[] = [
  {
    id: 'createdAt',
    header: 'Thời gian',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const m = moment(row.original.createdAt)
      return (
        <span className="whitespace-nowrap text-xs tabular-nums">
          {m.isValid() ? m.format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      )
    },
  },
  {
    id: 'oldTax',
    header: 'Thuế cũ',
    accessorKey: 'oldTax',
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">{formatProductTaxPercent(row.original.oldTax)}</span>
    ),
  },
  {
    id: 'newTax',
    header: 'Thuế mới',
    accessorKey: 'newTax',
    cell: ({ row }) => (
      <span className="text-xs tabular-nums font-medium">{formatProductTaxPercent(row.original.newTax)}</span>
    ),
  },
  {
    id: 'change',
    header: 'Thay đổi',
    cell: ({ row }) => {
      const delta = productTaxChangeDelta(row.original.oldTax, row.original.newTax)
      const label = formatProductTaxChangeDelta(row.original.oldTax, row.original.newTax)
      return (
        <span
          className={cn(
            'text-xs tabular-nums font-medium',
            delta != null && delta > 0 && 'text-emerald-600',
            delta != null && delta < 0 && 'text-destructive',
            delta === 0 && 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      )
    },
  },
  {
    id: 'source',
    header: 'Nguồn',
    cell: ({ row }) => {
      const label = productTaxSourceLabel(row.original.sourceType)
      const sourceId = row.original.sourceId?.trim()
      return (
        <div className="max-w-[220px] text-xs">
          <p className="font-medium text-foreground">{label}</p>
          {sourceId ? (
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" title={sourceId}>
              {sourceId}
            </p>
          ) : null}
        </div>
      )
    },
  },
  {
    id: 'createdBy',
    header: 'Người thực hiện',
    accessorKey: 'createdBy',
    cell: ({ row }) => <span className="text-xs">{row.original.createdBy?.trim() || '—'}</span>,
  },
  {
    id: 'note',
    header: 'Ghi chú',
    accessorKey: 'note',
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[240px] text-xs text-muted-foreground">
        {row.original.note?.trim() || '—'}
      </span>
    ),
  },
]
