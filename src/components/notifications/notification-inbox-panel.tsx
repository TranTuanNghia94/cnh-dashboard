import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { isBatchOrderImportNotification } from '@/lib/batch-order-import-notification'
import { getExportJobMetadataFromNotification } from '@/lib/export-job'
import {
  getNotificationActionLabel,
  getNotificationSubtitle,
} from '@/lib/notification-copy'
import { formatNotificationTime, getNotificationVisual } from '@/lib/notification-display'
import { cn } from '@/lib/utils'
import type { INotification } from '@/types/notification'
import { isToday, isYesterday } from 'date-fns'
import { BellOff, Check } from 'lucide-react'

function NotificationCard({
  notification,
  onMarkRead,
  onOpenBatchImportDetail,
  compact,
  isMarking,
}: {
  notification: INotification
  onMarkRead: (id: string) => void
  onOpenBatchImportDetail?: (notification: INotification) => void
  compact?: boolean
  isMarking?: boolean
}) {
  const visual = getNotificationVisual(notification)
  const { Icon } = visual
  const isBatchImport = isBatchOrderImportNotification(notification)
  const exportJob = getExportJobMetadataFromNotification(notification)
  const isUnread = !notification.isRead
  const friendlySubtitle = getNotificationSubtitle(notification)
  const actionLabel = getNotificationActionLabel(notification)
  const canOpen = Boolean(actionLabel)

  const handlePrimaryAction = () => {
    if (isUnread) onMarkRead(notification.id)

    if (isBatchImport && onOpenBatchImportDetail) {
      onOpenBatchImportDetail(notification)
      return
    }

    if (exportJob?.downloadUrl) {
      window.open(exportJob.downloadUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (exportJob) {
      window.location.href = '/setting#exports'
      return
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <li>
      <article
        className={cn(
          'rounded-lg border px-3 py-3 transition-colors',
          isUnread ? 'border-primary/20 bg-primary/[0.04]' : 'border-border/70 bg-card',
        )}
      >
        <div className="flex gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              visual.iconWrapClass,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{visual.label}</p>
                <h3 className={cn('text-sm leading-snug', isUnread ? 'font-semibold' : 'font-medium text-foreground/90')}>
                  {notification.title}
                </h3>
              </div>
              {isUnread && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc" />
              )}
            </div>

            {friendlySubtitle ? (
              <p
                className={cn(
                  'mt-1 line-clamp-2 text-sm leading-relaxed',
                  visual.tone === 'error'
                    ? 'text-red-700'
                    : visual.tone === 'warning'
                      ? 'text-amber-800'
                      : 'text-muted-foreground',
                )}
              >
                {friendlySubtitle}
              </p>
            ) : (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {notification.message}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="mr-auto text-[11px] text-muted-foreground">
                {formatNotificationTime(notification.createdAt)}
              </p>
              {isUnread && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn('h-7 px-2 text-xs text-muted-foreground', compact && 'px-2')}
                  disabled={isMarking}
                  onClick={() => onMarkRead(notification.id)}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Đã đọc
                </Button>
              )}
              {canOpen && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs"
                  onClick={handlePrimaryAction}
                >
                  {actionLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

export function NotificationInboxPanel({
  notifications,
  onMarkRead,
  compact,
  emptyLabel = 'Không có thông báo',
  onOpenBatchImportDetail,
  isMarkingId,
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
          <p className="text-xs text-muted-foreground">
            Khi có cập nhật (tải file, phê duyệt…), thông báo sẽ hiện ở đây
          </p>
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
        <h2 className="px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
          <span className="ml-1 font-normal normal-case tracking-normal">({items.length})</span>
        </h2>
        <ul className="space-y-2">
          {items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              onOpenBatchImportDetail={onOpenBatchImportDetail}
              compact={compact}
              isMarking={isMarkingId === notification.id}
            />
          ))}
        </ul>
      </section>
    )
  }

  const inner = (
    <div className={cn('space-y-5', compact ? 'pr-1' : '')}>
      {renderGroup('Hôm nay', groups.today)}
      {renderGroup('Hôm qua', groups.yesterday)}
      {renderGroup('Trước đó', groups.older)}
    </div>
  )

  if (compact) {
    return <div className="min-h-0 flex-1 overflow-y-auto">{inner}</div>
  }

  return (
    <ScrollArea className="h-[min(72vh,640px)] w-full">
      {inner}
    </ScrollArea>
  )
}
