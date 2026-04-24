import { NotificationInboxPanel } from '@/components/notifications/notification-inbox-panel'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/contexts/notification-center'
import { createLazyFileRoute, Link } from '@tanstack/react-router'

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
    markingId,
    refetch,
  } = useNotificationCenter()

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
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/home">Về trang chủ</Link>
          </Button>
        </div>
      </div>
      <NotificationInboxPanel
        notifications={notifications}
        onMarkRead={markRead}
        isMarkingId={markingId}
      />
    </div>
  )
}
