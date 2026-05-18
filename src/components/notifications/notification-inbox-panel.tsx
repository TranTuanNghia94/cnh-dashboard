import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getBatchOrderImportSummaryFromNotification,
  isBatchOrderImportNotification,
} from '@/lib/batch-order-import-notification'
import { formatNotificationTime, getNotificationVisual } from '@/lib/notification-display'
import { cn } from '@/lib/utils'
import type { INotification } from '@/types/notification'
import { isToday, isYesterday } from 'date-fns'
import { BellOff, Check, ChevronRight, ExternalLink } from 'lucide-react'
import type { MouseEvent } from 'react'

function BatchImportStatRow({ notification }: { notification: INotification }) {
  const summary = getBatchOrderImportSummaryFromNotification(notification)
  if (!summary) return null

  const items = [
    { label: 'đơn', value: summary.ordersCreatedCount, show: summary.ordersCreatedCount > 0 },
    { label: 'SP mới', value: summary.newProductsCount, show: summary.newProductsCount > 0 },
    { label: 'NCC', value: summary.newVendorsCount, show: summary.newVendorsCount > 0 },
    { label: 'cảnh báo', value: summary.warningCount, show: summary.warningCount > 0, warn: true },
    { label: 'lỗi', value: summary.errorCount, show: summary.errorCount > 0, error: true },
  ].filter((item) => item.show)

  if (!items.length) return null

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {items.map((item) => (
        <span
          key={item.label}
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums',
            item.error
              ? 'bg-red-100 text-red-800'
              : item.warn
                ? 'bg-amber-100 text-amber-800'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {item.value} {item.label}
        </span>
      ))}
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkRead,
  isMarkingId,
  onOpenBatchImportDetail,
}: {
  notification: INotification
  onMarkRead: (id: string) => void
  isMarkingId?: string | null
  onOpenBatchImportDetail?: (notification: INotification) => void
}) {
  const visual = getNotificationVisual(notification)
  const { Icon } = visual
  const isBatchImport = isBatchOrderImportNotification(notification)
  const isUnread = !notification.isRead

  const handleOpen = () => {
    if (isBatchImport && onOpenBatchImportDetail) {
      onOpenBatchImportDetail(notification)
      return
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const handleMarkRead = (event: MouseEvent) => {
    event.stopPropagation()
    onMarkRead(notification.id)
  }

  return (
    <li>
      <article
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleOpen()
          }
        }}
        className={cn(
          'group relative flex cursor-pointer gap-3 rounded-xl border border-l-[3px] p-3 transition-all',
          'hover:border-border hover:bg-muted/40 hover:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          visual.accentClass,
          isUnread ? 'bg-primary/[0.04] shadow-sm' : 'bg-card',
        )}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            visual.iconWrapClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={visual.badgeVariant} className="h-5 px-1.5 text-[10px] font-medium">
              {visual.label}
            </Badge>
            {isUnread && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Mới
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
            {notification.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {notification.message}
          </p>

          {isBatchImport && <BatchImportStatRow notification={notification} />}

          <p className="text-[11px] text-muted-foreground/80">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />

          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
            {!isBatchImport && notification.actionUrl && (
              <Button type="button" size="sm" variant="ghost" className="h-7 px-2" asChild>
                <a href={notification.actionUrl}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {isUnread && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1 px-2 text-xs"
                disabled={isMarkingId === notification.id}
                onClick={handleMarkRead}
                title="Đánh dấu đã đọc"
              >
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Đã đọc</span>
              </Button>
            )}
          </div>
        </div>
      </article>
    </li>
  )
}

export function NotificationInboxPanel({
  notifications,
  onMarkRead,
  isMarkingId,
  compact,
  emptyLabel = 'Không có thông báo',
  onOpenBatchImportDetail,
}: {
  notifications: INotification[]
  onMarkRead: (id: string) => void
  isMarkingId?: string | null
  compact?: boolean
  emptyLabel?: string
  onOpenBatchImportDetail?: (notification: INotification) => void
}) {
  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BellOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
          <p className="text-xs text-muted-foreground">Thông báo mới sẽ hiển thị tại đây</p>
        </div>
      </div>
    )
  }

  const parseCreatedAt = (value: string) => {
    const parsed = new Date(value.replace(' ', 'T'))
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const groups = notifications.reduce(
    (acc, notification) => {
      const createdAt = parseCreatedAt(notification.createdAt)
      if (createdAt && isToday(createdAt)) {
        acc.today.push(notification)
      } else if (createdAt && isYesterday(createdAt)) {
        acc.yesterday.push(notification)
      } else {
        acc.older.push(notification)
      }
      return acc
    },
    {
      today: [] as INotification[],
      yesterday: [] as INotification[],
      older: [] as INotification[],
    },
  )

  const renderGroup = (title: string, items: INotification[]) => {
    if (!items.length) return null
    return (
      <section className="space-y-2">
        <div className="sticky top-0 z-[1] -mx-1 bg-background/95 px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
          {title}
          <span className="ml-1.5 font-normal text-muted-foreground/70">({items.length})</span>
        </div>
        <ul className="space-y-2">
          {items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              isMarkingId={isMarkingId}
              onOpenBatchImportDetail={onOpenBatchImportDetail}
            />
          ))}
        </ul>
      </section>
    )
  }

  const inner = (
    <div className={cn('space-y-5', compact ? 'pr-0.5' : 'pr-2')}>
      {renderGroup('Hôm nay', groups.today)}
      {renderGroup('Hôm qua', groups.yesterday)}
      {renderGroup('Trước đó', groups.older)}
    </div>
  )

  if (compact) {
    return <div className="min-h-0 flex-1 overflow-y-auto pr-1">{inner}</div>
  }

  return (
    <ScrollArea className="h-[min(70vh,560px)] w-full rounded-xl border bg-muted/10 p-3">
      {inner}
    </ScrollArea>
  )
}
