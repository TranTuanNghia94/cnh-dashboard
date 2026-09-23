import { NotificationInboxPanel } from '@/components/notifications/notification-inbox-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/contexts/notification-center'
import { cn } from '@/lib/utils'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { Bell, CheckCheck, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/notifications/')({
  component: NotificationsPage,
})

const FILTERS = [
  { id: 'all' as const, label: 'Tất cả' },
  { id: 'unread' as const, label: 'Chưa đọc' },
  { id: 'read' as const, label: 'Đã đọc' },
]

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    markRead,
    markAllRead,
    isMarkingAll,
    markingId,
    refetch,
    openBatchImportDetail,
  } = useNotificationCenter()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead)
    if (filter === 'read') return notifications.filter((n) => n.isRead)
    return notifications
  }, [filter, notifications])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Thông báo</h1>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Đang tải…' : `${unreadCount} chưa đọc · ${totalCount} tổng`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs"
            disabled={!unreadCount || isMarkingAll}
            onClick={markAllRead}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Đọc tất cả
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground" onClick={() => refetch()}>
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Làm mới
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" asChild>
            <Link to="/home">Trang chủ</Link>
          </Button>
        </div>
      </div>

      <div className="inline-flex w-fit rounded-lg bg-muted p-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
              filter === item.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            {item.id === 'unread' && unreadCount > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      <NotificationInboxPanel
        notifications={filteredNotifications}
        onMarkRead={markRead}
        isMarkingId={markingId}
        onOpenBatchImportDetail={openBatchImportDetail}
        emptyLabel={
          filter === 'all'
            ? 'Không có thông báo'
            : filter === 'unread'
              ? 'Không có thông báo chưa đọc'
              : 'Không có thông báo đã đọc'
        }
      />
    </div>
  )
}
