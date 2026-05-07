import { NotificationInboxPanel } from '@/components/notifications/notification-inbox-panel'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/contexts/notification-center'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createLazyFileRoute('/_app/_wrapper/notifications/')({
  component: NotificationsPage,
})

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
  } = useNotificationCenter()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead)
    if (filter === 'read') return notifications.filter((n) => n.isRead)
    return notifications
  }, [filter, notifications])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Thông báo</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Đang tải…'
              : `${unreadCount} chưa đọc · ${totalCount} tổng`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!unreadCount || isMarkingAll}
            onClick={markAllRead}
          >
            Đọc tất cả
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/home">Về trang chủ</Link>
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          Tất cả
        </Button>
        <Button size="sm" variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>
          Chưa đọc
        </Button>
        <Button size="sm" variant={filter === 'read' ? 'default' : 'outline'} onClick={() => setFilter('read')}>
          Đã đọc
        </Button>
      </div>
      <NotificationInboxPanel
        notifications={filteredNotifications}
        onMarkRead={markRead}
        isMarkingId={markingId}
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
