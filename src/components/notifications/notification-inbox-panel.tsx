import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { INotification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowUpRight } from 'lucide-react'

function typeBadgeVariant(
  type: string,
): 'success' | 'destructive' | 'warning' | 'default' | 'secondary' {
  if (type === 'SUCCESS') return 'success'
  if (type === 'ERROR') return 'destructive'
  if (type === 'WARNING') return 'warning'
  if (type === 'APPROVAL') return 'default'
  return 'secondary'
}

export function NotificationInboxPanel({
  notifications,
  onMarkRead,
  isMarkingId,
  compact,
  emptyLabel = 'Không có thông báo',
}: {
  notifications: INotification[]
  onMarkRead: (id: string) => void
  isMarkingId?: string | null
  compact?: boolean
  emptyLabel?: string
}) {
  if (!notifications.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
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

  const renderNotificationItem = (n: INotification) => (
    <li
      key={n.id}
      className={cn(
        'rounded-lg border p-3 transition-colors',
        !n.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={typeBadgeVariant(n.type)} className="shrink-0">
              {n.type}
            </Badge>
            {!n.isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <a href={n.actionUrl} className="block text-sm font-semibold text-foreground hover:underline">
            {n.title}
          </a>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
            {n.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {(() => {
              try {
                return formatDistanceToNow(new Date(n.createdAt.replace(' ', 'T')), {
                  addSuffix: true,
                  locale: vi,
                })
              } catch {
                return n.createdAt
              }
            })()}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" size="sm" variant="ghost" asChild>
            <a href={n.actionUrl}>
              Mở <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          {!n.isRead && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isMarkingId === n.id}
              onClick={() => onMarkRead(n.id)}
            >
              Đã đọc
            </Button>
          )}
        </div>
      </div>
    </li>
  )

  const renderGroup = (title: string, items: INotification[]) => {
    if (!items.length) return null
    return (
      <section className="space-y-2">
        <div className="sticky top-0 z-[1] bg-background/80 px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
          {title}
        </div>
        <ul className="space-y-2">
          {items.map(renderNotificationItem)}
        </ul>
      </section>
    )
  }

  const inner = (
    <div className={cn('space-y-4', compact ? 'pr-1' : 'pr-3')}>
      {renderGroup('Hôm nay', groups.today)}
      {renderGroup('Hôm qua', groups.yesterday)}
      {renderGroup('Cũ hơn', groups.older)}
    </div>
  )

  if (compact) {
    return <div className="max-h-[min(70vh,520px)] overflow-y-auto pr-1">{inner}</div>
  }

  return (
    <ScrollArea className="h-[min(70vh,560px)] w-full rounded-md border p-3">
      {inner}
    </ScrollArea>
  )
}
