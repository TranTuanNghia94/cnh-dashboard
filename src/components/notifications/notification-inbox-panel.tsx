import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { INotification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

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
      <p className="text-sm text-muted-foreground py-8 text-center">{emptyLabel}</p>
    )
  }

  const inner = (
    <ul className={cn('space-y-2', compact ? 'pr-1' : 'pr-3')}>
      {notifications.map((n) => (
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
              <a
                href={n.actionUrl}
                className="block font-medium text-foreground hover:underline"
              >
                {n.title}
              </a>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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
            {!n.isRead && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                disabled={isMarkingId === n.id}
                onClick={() => onMarkRead(n.id)}
              >
                Đã đọc
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
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
