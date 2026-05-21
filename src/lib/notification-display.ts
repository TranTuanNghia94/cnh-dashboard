import type { INotification, NotificationType } from '@/types/notification'
import { isExportJobNotification } from '@/lib/export-job'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Info,
  XCircle,
} from 'lucide-react'

export type NotificationVisualTone = 'success' | 'error' | 'warning' | 'info' | 'default'

export type NotificationVisual = {
  tone: NotificationVisualTone
  label: string
  Icon: LucideIcon
  accentClass: string
  iconWrapClass: string
  badgeVariant: 'success' | 'destructive' | 'warning' | 'default' | 'secondary'
}

const TYPE_LABELS: Record<string, string> = {
  SUCCESS: 'Thành công',
  ERROR: 'Lỗi',
  WARNING: 'Cảnh báo',
  INFO: 'Thông tin',
  APPROVAL: 'Phê duyệt',
}

export const getNotificationVisual = (notification: INotification): NotificationVisual => {
  if (isExportJobNotification(notification)) {
    const hasErrors = notification.type === 'ERROR'
    return {
      tone: hasErrors ? 'error' : 'success',
      label: 'Xuất Excel',
      Icon: FileSpreadsheet,
      accentClass: hasErrors ? 'border-l-red-500' : 'border-l-emerald-500',
      iconWrapClass: hasErrors ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700',
      badgeVariant: hasErrors ? 'destructive' : 'success',
    }
  }

  if (notification.referenceType === 'BATCH_ORDER_IMPORT') {
    const hasErrors = notification.type === 'ERROR'
    const hasWarnings = notification.type === 'WARNING'
    return {
      tone: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
      label: 'Tải file Excel',
      Icon: FileSpreadsheet,
      accentClass: hasErrors
        ? 'border-l-red-500'
        : hasWarnings
          ? 'border-l-amber-500'
          : 'border-l-emerald-500',
      iconWrapClass: hasErrors
        ? 'bg-red-100 text-red-700'
        : hasWarnings
          ? 'bg-amber-100 text-amber-700'
          : 'bg-emerald-100 text-emerald-700',
      badgeVariant: hasErrors ? 'destructive' : hasWarnings ? 'warning' : 'success',
    }
  }

  const type = notification.type as NotificationType

  if (type === 'SUCCESS') {
    return {
      tone: 'success',
      label: TYPE_LABELS.SUCCESS,
      Icon: CheckCircle2,
      accentClass: 'border-l-emerald-500',
      iconWrapClass: 'bg-emerald-100 text-emerald-700',
      badgeVariant: 'success',
    }
  }

  if (type === 'ERROR') {
    return {
      tone: 'error',
      label: TYPE_LABELS.ERROR,
      Icon: XCircle,
      accentClass: 'border-l-red-500',
      iconWrapClass: 'bg-red-100 text-red-700',
      badgeVariant: 'destructive',
    }
  }

  if (type === 'WARNING') {
    return {
      tone: 'warning',
      label: TYPE_LABELS.WARNING,
      Icon: AlertTriangle,
      accentClass: 'border-l-amber-500',
      iconWrapClass: 'bg-amber-100 text-amber-700',
      badgeVariant: 'warning',
    }
  }

  if (type === 'APPROVAL') {
    return {
      tone: 'info',
      label: TYPE_LABELS.APPROVAL,
      Icon: ClipboardCheck,
      accentClass: 'border-l-blue-500',
      iconWrapClass: 'bg-blue-100 text-blue-700',
      badgeVariant: 'default',
    }
  }

  if (type === 'INFO') {
    return {
      tone: 'info',
      label: TYPE_LABELS.INFO,
      Icon: Info,
      accentClass: 'border-l-sky-500',
      iconWrapClass: 'bg-sky-100 text-sky-700',
      badgeVariant: 'secondary',
    }
  }

  return {
    tone: 'default',
    label: type || 'Thông báo',
    Icon: Bell,
    accentClass: 'border-l-muted-foreground/40',
    iconWrapClass: 'bg-muted text-muted-foreground',
    badgeVariant: 'secondary',
  }
}

export const formatNotificationTime = (createdAt: string): string => {
  try {
    return formatDistanceToNow(new Date(createdAt.replace(' ', 'T')), {
      addSuffix: true,
      locale: vi,
    })
  } catch {
    return createdAt
  }
}
