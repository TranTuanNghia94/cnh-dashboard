import { NotificationInboxPanel } from '@/components/notifications/notification-inbox-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/contexts/notification-center'
import { cn } from '@/lib/utils'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { Bell, RefreshCw } from 'lucide-react'
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
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Thông báo</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                'Đang tải…'
              ) : (
                <>
                  <span className="font-medium text-foreground">{unreadCount}</span> chưa đọc
                  <span className="mx-1.5 text-muted-foreground/50">·</span>
                  <span>{totalCount} tổng</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!unreadCount || isMarkingAll}
            onClick={markAllRead}
          >
            Đọc tất cả
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Làm mới
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/home">Về trang chủ</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? 'default' : 'outline'}
            className="gap-1.5"
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            {item.id === 'unread' && unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </Button>
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
