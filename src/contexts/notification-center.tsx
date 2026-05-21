import { BatchOrderImportNotificationDialog } from '@/components/notifications/batch-order-import-notification-dialog'
import { NotificationInboxPanel } from '@/components/notifications/notification-inbox-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { QUERIES } from '@/lib/constants'
import { getBatchOrderImportToastDescription } from '@/lib/batch-order-import-toast'
import { isBatchOrderImportNotification } from '@/lib/batch-order-import-notification'
import { getExportJobMetadataFromNotification, isExportJobNotification } from '@/lib/export-job'
import { consumeNotificationSse } from '@/lib/notification-sse'
import { getCookie, TOKEN } from '@/lib/cookie'
import { getNotifications, markNotificationRead } from '@/services/notification'
import type { INotification, INotificationsInbox } from '@/types/notification'
import { IGenericResponse } from '@/types/other'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BellIcon } from 'lucide-react'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type NotificationCenterContextValue = {
  unreadCount: number
  totalCount: number
  notifications: INotificationsInbox['notifications']
  isLoading: boolean
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  openSheet: () => void
  openBatchImportDetail: (notification: INotification) => void
  refetch: () => void
  markRead: (id: string) => void
  markAllRead: () => void
  markingId: string | null
  isMarkingAll: boolean
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(
  null,
)

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext)
  if (!ctx) {
    throw new Error('useNotificationCenter must be used within NotificationCenterProvider')
  }
  return ctx
}

function mergeNotificationEvent(inbox: INotificationsInbox, n: INotification): INotificationsInbox {
  const idx = inbox.notifications.findIndex((x) => x.id === n.id)
  const prevRow = idx >= 0 ? inbox.notifications[idx] : undefined
  const list =
    idx >= 0
      ? inbox.notifications.map((x) => (x.id === n.id ? { ...x, ...n } : x))
      : [n, ...inbox.notifications]

  let unreadCount = inbox.unreadCount
  if (idx >= 0 && prevRow) {
    if (prevRow.isRead === false && n.isRead) unreadCount = Math.max(0, unreadCount - 1)
    if (prevRow.isRead === true && !n.isRead) unreadCount += 1
  } else if (!n.isRead) {
    unreadCount += 1
  }

  const totalCount = idx >= 0 ? inbox.totalCount : inbox.totalCount + 1

  return {
    ...inbox,
    notifications: list,
    unreadCount,
    totalCount,
  }
}

export function NotificationCenterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [batchImportNotification, setBatchImportNotification] = useState<INotification | null>(null)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const reconnectMsRef = useRef(1000)

  const inboxQuery = useQuery({
    queryKey: [QUERIES.NOTIFICATIONS_INBOX],
    queryFn: () => getNotifications({ page: 0, limit: 100 }),
    enabled: Boolean(getCookie(TOKEN)),
  })

  const inboxData = inboxQuery.data?.data

  const patchInbox = useCallback(
    (fn: (inbox: INotificationsInbox) => INotificationsInbox) => {
      queryClient.setQueryData<IGenericResponse<INotificationsInbox>>(
        [QUERIES.NOTIFICATIONS_INBOX],
        (prev) => {
          if (!prev?.data) return prev
          return { ...prev, data: fn(prev.data) }
        },
      )
    },
    [queryClient],
  )

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERIES.NOTIFICATIONS_INBOX] })
      const prev = queryClient.getQueryData<IGenericResponse<INotificationsInbox>>([
        QUERIES.NOTIFICATIONS_INBOX,
      ])
      patchInbox((inbox) => {
        const row = inbox.notifications.find((x) => x.id === id)
        if (!row || row.isRead) return inbox
        return {
          ...inbox,
          notifications: inbox.notifications.map((x) =>
            x.id === id ? { ...x, isRead: true } : x,
          ),
          unreadCount: Math.max(0, inbox.unreadCount - 1),
        }
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData([QUERIES.NOTIFICATIONS_INBOX], ctx.prev)
      }
      toast({
        variant: 'destructive',
        title: 'Không thể đánh dấu đã đọc',
      })
    },
  })

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const schedule = (fn: () => void, ms: number) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(fn, ms)
    }

    const run = () => {
      if (cancelled) return
      const token = getCookie(TOKEN)
      if (!token) {
        schedule(run, 4000)
        return
      }

      const ac = new AbortController()
      abortRef.current = ac

      void consumeNotificationSse({
        signal: ac.signal,
        onInit: (data) => {
          reconnectMsRef.current = 1000
          patchInbox((inbox) => ({ ...inbox, unreadCount: data.unreadCount }))
        },
        onNotification: (n) => {
          reconnectMsRef.current = 1000
          patchInbox((inbox) => mergeNotificationEvent(inbox, n))
          const isBatchImport = isBatchOrderImportNotification(n)
          const isExportJob = isExportJobNotification(n)
          const exportJob = getExportJobMetadataFromNotification(n)
          if (isExportJob) {
            void queryClient.invalidateQueries({ queryKey: [QUERIES.EXPORT_JOBS] })
          }
          toast({
            title: isBatchImport ? 'Tải file Excel xong' : isExportJob ? 'Xuất Excel hoàn tất' : n.title,
            description: isBatchImport
              ? getBatchOrderImportToastDescription(n)
              : isExportJob
                ? n.message || 'File Excel đã được xử lý xong.'
                : n.message,
            variant:
              n.type === 'ERROR'
                ? 'destructive'
                : n.type === 'WARNING'
                  ? 'warning'
                  : n.type === 'SUCCESS'
                    ? 'success'
                    : 'default',
            action: isBatchImport ? (
              <ToastAction
                altText="Xem kết quả tải file"
                onClick={() => setBatchImportNotification(n)}
              >
                Xem kết quả
              </ToastAction>
            ) : exportJob?.downloadUrl ? (
              <ToastAction
                altText="Tải file Excel"
                onClick={() => window.open(exportJob.downloadUrl, '_blank', 'noopener,noreferrer')}
              >
                Tải Excel
              </ToastAction>
            ) : exportJob ? (
              <ToastAction
                altText="Xem lịch sử xuất Excel"
                onClick={() => {
                  window.location.href = '/setting#exports'
                }}
              >
                Xem lịch sử
              </ToastAction>
            ) : undefined,
          })
        },
        onError: () => {
          // stream error or non-ok response
        },
      })
        .catch(() => {
          /* aborted */
        })
        .finally(() => {
          if (cancelled || ac.signal.aborted) return
          const wait = reconnectMsRef.current
          reconnectMsRef.current = Math.min(reconnectMsRef.current * 2, 30_000)
          schedule(run, wait)
        })
    }

    run()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      abortRef.current?.abort()
    }
  }, [patchInbox, queryClient, toast])

  const unreadCount = inboxData?.unreadCount ?? 0
  const totalCount = inboxData?.totalCount ?? 0
  const notifications = useMemo(() => inboxData?.notifications ?? [], [inboxData?.notifications])

  const markingId =
    markReadMutation.isPending && markReadMutation.variables != null
      ? markReadMutation.variables
      : null

  const markRead = useCallback(
    (id: string) => {
      markReadMutation.mutate(id)
    },
    [markReadMutation],
  )

  const markAllRead = useCallback(() => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
    if (!unreadIds.length) return
    setIsMarkingAll(true)
    void Promise.allSettled(unreadIds.map((id) => markReadMutation.mutateAsync(id))).finally(() =>
      setIsMarkingAll(false),
    )
  }, [markReadMutation, notifications])

  const refetch = useCallback(() => {
    void inboxQuery.refetch()
  }, [inboxQuery])

  const openSheet = useCallback(() => setSheetOpen(true), [])

  const openBatchImportDetail = useCallback(
    (notification: INotification) => {
      setBatchImportNotification(notification)
      if (!notification.isRead) {
        markReadMutation.mutate(notification.id)
      }
    },
    [markReadMutation],
  )

  const value = useMemo<NotificationCenterContextValue>(
    () => ({
      unreadCount,
      totalCount,
      notifications,
      isLoading: inboxQuery.isLoading,
      sheetOpen,
      setSheetOpen,
      openSheet,
      openBatchImportDetail,
      refetch,
      markRead,
      markAllRead,
      markingId,
      isMarkingAll,
    }),
    [
      inboxQuery.isLoading,
      markRead,
      markAllRead,
      markingId,
      isMarkingAll,
      notifications,
      openSheet,
      openBatchImportDetail,
      refetch,
      sheetOpen,
      totalCount,
      unreadCount,
    ],
  )

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="space-y-2 border-b px-5 py-4 text-left">
            <div className="flex items-center justify-between gap-2 pr-6">
              <SheetTitle className="text-lg">Thông báo</SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-6 shrink-0 px-2 text-xs">
                  {unreadCount} mới
                </Badge>
              )}
            </div>
            <SheetDescription>
              {totalCount > 0
                ? 'Bấm «Xem kết quả tải file» để xem chi tiết sau khi upload Excel'
                : 'Thông báo mới sẽ hiện ở đây'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex shrink-0 flex-wrap gap-2 border-b px-5 py-3">
            <Button type="button" variant="outline" size="sm" onClick={() => value.refetch()}>
              Làm mới
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!unreadCount || value.isMarkingAll}
              onClick={() => value.markAllRead()}
            >
              Đọc tất cả
            </Button>
            <Button type="button" variant="ghost" size="sm" className="ml-auto" asChild>
              <Link to="/notifications" onClick={() => setSheetOpen(false)}>
                Xem tất cả
              </Link>
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
            <NotificationInboxPanel
              compact
              notifications={notifications}
              onMarkRead={value.markRead}
              isMarkingId={value.markingId}
              onOpenBatchImportDetail={openBatchImportDetail}
            />
          </div>
        </SheetContent>
      </Sheet>
      <BatchOrderImportNotificationDialog
        notification={batchImportNotification}
        open={batchImportNotification != null}
        onMarkRead={value.markRead}
        onOpenChange={(open) => {
          if (!open) setBatchImportNotification(null)
        }}
      />
    </NotificationCenterContext.Provider>
  )
}

export function NotificationHeaderBell() {
  const { unreadCount, openSheet } = useNotificationCenter()
  const hasUnread = unreadCount > 0

  return (
    <button
      type="button"
      onClick={openSheet}
      className={cn(
        'relative inline-flex rounded-md p-1.5 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label="Thông báo"
    >
      {hasUnread && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="h-12 w-12 rounded-full bg-primary/35 blur-lg motion-safe:animate-notif-aura" />
        </span>
      )}
      <BellIcon
        className={cn(
          'relative z-[1] h-6 w-6 origin-[50%_12%] drop-shadow-sm',
          hasUnread &&
            'text-blue-500 motion-safe:animate-notif-bell-ring motion-safe:drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)]',
        )}
      />
      {hasUnread && (
        <span className="absolute -right-1 -top-1 z-[2] flex h-6 min-w-6 items-center justify-center">
          <span
            className="absolute inline-flex h-5 w-5 rounded-full bg-destructive/50 motion-safe:animate-ping motion-safe:[animation-duration:1.25s]"
            aria-hidden
          />
          <span
            className="absolute inline-flex h-5 w-5 rounded-full bg-destructive/35 motion-safe:animate-ping motion-safe:[animation-duration:1.6s] motion-safe:[animation-delay:0.35s]"
            aria-hidden
          />
          <Badge
            variant="destructive"
            className="relative z-[1] h-5 min-w-5 px-1 flex items-center justify-center border-0 p-0 text-[10px] shadow-md motion-safe:animate-notif-badge-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        </span>
      )}
    </button>
  )
}
