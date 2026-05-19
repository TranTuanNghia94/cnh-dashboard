import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { isBatchOrderImportNotification } from '@/lib/batch-order-import-notification'
import {
  getNotificationActionLabel,
  getNotificationSubtitle,
} from '@/lib/notification-copy'
import { formatNotificationTime, getNotificationVisual } from '@/lib/notification-display'
import { cn } from '@/lib/utils'
import type { INotification } from '@/types/notification'
import { isToday, isYesterday } from 'date-fns'
import { BellOff } from 'lucide-react'

function NotificationCard({
  notification,
  onMarkRead,
  onOpenBatchImportDetail,
}: {
  notification: INotification
  onMarkRead: (id: string) => void
  onOpenBatchImportDetail?: (notification: INotification) => void
}) {
  const visual = getNotificationVisual(notification)
  const { Icon } = visual
  const isBatchImport = isBatchOrderImportNotification(notification)
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

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <li>
      <article
        className={cn(
          'rounded-xl border border-l-[3px] p-4 transition-colors',
          visual.accentClass,
          isUnread ? 'border-primary/25 bg-primary/[0.03]' : 'bg-card',
        )}
      >
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                visual.iconWrapClass,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            {isUnread && (
              <span
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                aria-label="Chưa đọc"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">{visual.label}</p>
              <h3 className="text-sm font-semibold leading-snug text-foreground">{notification.title}</h3>

              {friendlySubtitle ? (
                <p
                  className={cn(
                    'text-sm leading-relaxed',
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
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {notification.message}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {formatNotificationTime(notification.createdAt)}
              </p>
            </div>

            {canOpen && (
              <Button
                type="button"
                size="sm"
                variant={isBatchImport ? 'default' : 'outline'}
                className="h-8"
                onClick={handlePrimaryAction}
              >
                {actionLabel}
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
      <section className="space-y-2.5">
        <h2 className="px-0.5 text-xs font-semibold text-muted-foreground">
          {title}
          <span className="ml-1 font-normal">({items.length})</span>
        </h2>
        <ul className="space-y-2.5">
          {items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              onOpenBatchImportDetail={onOpenBatchImportDetail}
            />
          ))}
        </ul>
      </section>
    )
  }

  const inner = (
    <div className={cn('space-y-6', compact ? 'pr-0.5' : 'pr-1')}>
      {renderGroup('Hôm nay', groups.today)}
      {renderGroup('Hôm qua', groups.yesterday)}
      {renderGroup('Trước đó', groups.older)}
    </div>
  )

  if (compact) {
    return <div className="min-h-0 flex-1 overflow-y-auto">{inner}</div>
  }

  return (
    <ScrollArea className="h-[min(70vh,560px)] w-full rounded-xl border bg-muted/10 p-4">
      {inner}
    </ScrollArea>
  )
}
