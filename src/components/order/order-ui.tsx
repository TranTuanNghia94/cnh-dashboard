import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { memo } from 'react'

export type FilterBadgeProps = {
  label: string
  value: string
  onClear: () => void
}

export const FilterBadge = memo(function FilterBadge({
  label,
  value,
  onClear,
}: FilterBadgeProps) {
  return (
  <button
    type="button"
    onClick={onClear}
    className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    aria-label={`Xóa bộ lọc ${label}: ${value}`}
  >
    <span className="whitespace-nowrap">
      {label}: <span className="font-semibold text-foreground">{value}</span>
    </span>
    <XIcon className="h-3 w-3" />
  </button>
  )
})

export type LineMetricProps = {
  icon: LucideIcon
  label: string
  value: string
  helper?: string
}

export const LineMetric = memo(function LineMetric({
  icon: Icon,
  label,
  value,
  helper,
}: LineMetricProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-background/60 p-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
        {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
      </div>
    </div>
  )
})

export type SectionStatusBadgeProps = {
  ready: boolean
  label: string
}

export const SectionStatusBadge = memo(function SectionStatusBadge({
  ready,
  label,
}: SectionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase',
        ready ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700',
      )}
    >
      {label}
    </span>
  )
})

export type SectionStepProps = {
  icon: LucideIcon
  label: string
  helper: string
  state: 'done' | 'current' | 'pending'
}

export const SectionStep = memo(function SectionStep({
  icon: Icon,
  label,
  helper,
  state,
}: SectionStepProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border px-4 py-3 text-sm transition-colors',
        state === 'done' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
        state === 'current' && 'border-primary/50 bg-primary/5 text-primary',
        state === 'pending' && 'border-border bg-background text-muted-foreground',
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border',
            state === 'done' && 'border-emerald-200 bg-white text-emerald-600',
            state === 'current' && 'border-primary/40 bg-white text-primary',
            state === 'pending' && 'border-border bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-semibold">{label}</p>
      </div>
      <p className="text-xs">{helper}</p>
      {state === 'current' && (
        <span className="text-[11px] font-medium uppercase text-primary">Đang thực hiện</span>
      )}
      {state === 'pending' && (
        <span className="text-[11px] uppercase text-muted-foreground">Chờ hoàn thành</span>
      )}
      {state === 'done' && (
        <span className="text-[11px] uppercase text-emerald-700">Đã hoàn tất</span>
      )}
    </div>
  )
})

export type OrderMetaItemProps = {
  label: string
  value: string
  helper?: string | null
}

export const OrderMetaItem = memo(function OrderMetaItem({
  label,
  value,
  helper,
}: OrderMetaItemProps) {
  return (
    <div className="min-w-[150px]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-base font-semibold text-foreground">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
})

export type OrderSummaryMeta = {
  code: string
  statusLabel: string
  statusClass: string
  updatedAtText: string
  createdAtText?: string | null
  lineCount: number
  customerName: string
  customerCode?: string | null
  orderNumber?: number | null
}

export type OrderSummaryCardProps = {
  meta: OrderSummaryMeta
  totalText: string
  deliveryText: string
  addressText?: string | null
}

export const OrderSummaryCard = ({
  meta,
  totalText,
  deliveryText,
  addressText,
}: OrderSummaryCardProps) => (
  <Card className="mt-4 border bg-muted/30">
    <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge
            variant="secondary"
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
              meta.statusClass,
            )}
          >
            {meta.statusLabel}
          </Badge>
          <span>Cập nhật {meta.updatedAtText}</span>
        </div>
        <p className="text-lg font-semibold text-foreground">{meta.code}.{meta.orderNumber?.toString().padStart(3, '0') ?? '—'}</p>
        {meta.createdAtText && (
          <p className="text-sm text-muted-foreground">Tạo ngày {meta.createdAtText}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-6 justify">
        <OrderMetaItem
          label="Tạm tính hiện tại"
          value={totalText}
          helper={`${meta.lineCount} dòng`}
        />
        <OrderMetaItem
          label="Khách hàng"
          value={meta.customerName}
          helper={meta.customerCode}
        />
        <OrderMetaItem label="Ngày giao" value={deliveryText} helper={addressText} />
      </div>
    </CardContent>
  </Card>
)


