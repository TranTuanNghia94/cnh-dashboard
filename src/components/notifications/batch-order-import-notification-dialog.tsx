import { BatchOrderImportSummaryView } from '@/components/notifications/batch-order-import-summary'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useBatchOrderImportJob } from '@/hooks/use-batch-order-import-job'
import {
  getBatchOrderImportJobIdFromNotification,
  getBatchOrderImportSummaryFromNotification,
} from '@/lib/batch-order-import-notification'
import { getNotificationVisual } from '@/lib/notification-display'
import { cn } from '@/lib/utils'
import type { INotification } from '@/types/notification'
import { Link } from '@tanstack/react-router'
import { ListOrdered } from 'lucide-react'
import { useMemo } from 'react'

type BatchOrderImportNotificationDialogProps = {
  notification: INotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkRead?: (id: string) => void
}

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}

export function BatchOrderImportNotificationDialog({
  notification,
  open,
  onOpenChange,
  onMarkRead,
}: BatchOrderImportNotificationDialogProps) {
  const metadataSummary = useMemo(
    () => (notification ? getBatchOrderImportSummaryFromNotification(notification) : null),
    [notification],
  )

  const jobId = useMemo(
    () => (notification ? getBatchOrderImportJobIdFromNotification(notification) : null),
    [notification],
  )

  const shouldFetchJob = open && !metadataSummary && Boolean(jobId)
  const { data: jobSummary, isLoading, isError, refetch } = useBatchOrderImportJob(jobId, shouldFetchJob)

  const summary = metadataSummary ?? jobSummary ?? null
  const visual = notification ? getNotificationVisual(notification) : null
  const HeaderIcon = visual?.Icon

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && notification && !notification.isRead) {
      onMarkRead?.(notification.id)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-3 border-b bg-muted/20 px-6 py-5 text-left">
          <div className="flex items-start gap-3">
            {HeaderIcon && visual && (
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                  visual.iconWrapClass,
                )}
              >
                <HeaderIcon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle className="text-lg leading-snug">
                {notification?.title ?? 'Kết quả import đơn hàng'}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {notification?.message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <SummarySkeleton />}

          {!isLoading && isError && !summary && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-destructive">Không tải được chi tiết job.</p>
              <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          )}

          {!isLoading && summary && <BatchOrderImportSummaryView summary={summary} />}
        </div>

        <DialogFooter className="gap-2 border-t bg-muted/10 px-6 py-4 sm:justify-between">
          <Button type="button" variant="ghost" asChild>
            <Link to="/order">
              <ListOrdered className="mr-2 h-4 w-4" />
              Danh sách đơn
            </Link>
          </Button>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
