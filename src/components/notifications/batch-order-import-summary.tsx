import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { getBatchImportPlainSummary } from '@/lib/notification-copy'
import { cn } from '@/lib/utils'
import type { IBatchOrderImportSummary } from '@/types/batch-order-import'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, CheckCircle2, Copy, XCircle } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

type BatchOrderImportSummaryViewProps = {
  summary: IBatchOrderImportSummary
}

type SummaryTone = 'success' | 'warning' | 'error'

function getSummaryTone(summary: IBatchOrderImportSummary): SummaryTone {
  if (summary.errorCount > 0 && summary.ordersCreatedCount === 0) return 'error'
  if (summary.warningCount > 0 || summary.errorCount > 0) return 'warning'
  return 'success'
}

const toneConfig: Record<
  SummaryTone,
  { banner: string; icon: typeof CheckCircle2 }
> = {
  success: {
    banner: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
  },
  warning: {
    banner: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: AlertTriangle,
  },
  error: {
    banner: 'border-red-200 bg-red-50 text-red-900',
    icon: XCircle,
  },
}

function MessageListPanel({
  title,
  description,
  lines,
  tone,
  onCopy,
}: {
  title: string
  description: string
  lines: string[]
  tone: 'warning' | 'error'
  onCopy: (label: string, lines: string[]) => void
}) {
  if (!lines.length) return null

  const panelClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50/50'
      : 'border-red-200 bg-red-50/50'

  return (
    <div className={cn('rounded-lg border', panelClass)}>
      <div className="flex items-start justify-between gap-2 border-b border-inherit px-3 py-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="h-7 shrink-0 gap-1" onClick={() => onCopy(title, lines)}>
          <Copy className="h-3.5 w-3.5" />
          Sao chép
        </Button>
      </div>
      <ul className="max-h-64 divide-y overflow-y-auto">
        {lines.map((line, index) => (
          <li key={`${index}-${line.slice(0, 24)}`} className="flex gap-2 px-3 py-2.5 text-sm leading-relaxed">
            <span className="mt-0.5 shrink-0 text-xs font-medium text-muted-foreground">{index + 1}.</span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CountBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
      {count}
    </Badge>
  )
}

export function BatchOrderImportSummaryView({ summary }: BatchOrderImportSummaryViewProps) {
  const { toast } = useToast()
  const tone = getSummaryTone(summary)
  const config = toneConfig[tone]
  const StatusIcon = config.icon
  const plainSummary = getBatchImportPlainSummary(summary)

  const defaultTab = useMemo(() => 'overview', [])

  const [activeTab, setActiveTab] = useState(defaultTab)

  const copyText = useCallback(
    async (label: string, lines: string[]) => {
      const content = lines.join('\n')
      if (!content) return
      await navigator.clipboard.writeText(content)
      toast({
        title: 'Đã sao chép',
        description: `${label} (${lines.length} dòng)`,
        variant: 'success',
      })
    },
    [toast],
  )

  const hasIssues = summary.warnings.length > 0 || summary.errors.length > 0

  return (
    <div className="space-y-4">
      <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3.5', config.banner)}>
        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium leading-relaxed">{plainSummary}</p>
          <p className="text-xs opacity-80">
            File có {summary.totalRows} dòng dữ liệu
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">
            Tóm tắt
          </TabsTrigger>
          {summary.ordersCreated.length > 0 && (
            <TabsTrigger value="orders" className="text-xs">
              Đơn đã tạo
              <CountBadge count={summary.ordersCreated.length} />
            </TabsTrigger>
          )}
          {summary.newProducts.length > 0 && (
            <TabsTrigger value="products" className="text-xs">
              Sản phẩm mới
              <CountBadge count={summary.newProducts.length} />
            </TabsTrigger>
          )}
          {summary.newVendors.length > 0 && (
            <TabsTrigger value="vendors" className="text-xs">
              Nhà cung cấp mới
              <CountBadge count={summary.newVendors.length} />
            </TabsTrigger>
          )}
          {hasIssues && (
            <TabsTrigger value="issues" className="text-xs">
              Cần xử lý
              <CountBadge count={summary.warningCount + summary.errorCount} />
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border bg-emerald-50/50 p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-emerald-800">{summary.ordersCreatedCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Đơn hàng đã tạo</p>
            </div>
            <div className="rounded-lg border bg-amber-50/50 p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-amber-800">{summary.warningCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Dòng cần kiểm tra</p>
            </div>
            <div className="rounded-lg border bg-red-50/50 p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-red-800">{summary.errorCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Lỗi cần sửa</p>
            </div>
          </div>

          {summary.ordersCreated.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-medium">Một số đơn vừa tạo</p>
              <ul className="space-y-2">
                {summary.ordersCreated.slice(0, 5).map((order) => (
                  <li key={order.orderId || order.orderCode} className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      to="/order/$orderId"
                      params={{ orderId: order.orderCode }}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderCode}
                    </Link>
                    <span className="text-xs text-muted-foreground">{order.lineCount} dòng hàng</span>
                  </li>
                ))}
              </ul>
              {summary.ordersCreated.length > 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setActiveTab('orders')}
                >
                  Xem đủ {summary.ordersCreated.length} đơn
                </Button>
              )}
            </div>
          )}

          {hasIssues && (
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('issues')}>
              Xem chi tiết cần xử lý ({summary.warningCount + summary.errorCount})
            </Button>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <p className="mb-2 text-xs text-muted-foreground">
            Bấm mã đơn để mở và kiểm tra chi tiết.
          </p>
          <div className="overflow-hidden rounded-lg border">
            <Table wrapperClassName="h-auto max-h-72">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Số hợp đồng</TableHead>
                  <TableHead>Mã khách hàng</TableHead>
                  <TableHead className="text-right">Số dòng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.ordersCreated.map((order) => (
                  <TableRow key={order.orderId || order.orderCode}>
                    <TableCell>
                      <Link
                        to="/order/$orderId"
                        params={{ orderId: order.orderCode }}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.orderCode}
                      </Link>
                    </TableCell>
                    <TableCell>{order.contractNumber || '—'}</TableCell>
                    <TableCell>{order.customerCode || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{order.lineCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <p className="mb-2 text-xs text-muted-foreground">
            Các sản phẩm chưa có trong hệ thống đã được tạo mới khi import.
          </p>
          <div className="overflow-hidden rounded-lg border">
            <Table wrapperClassName="h-auto max-h-72">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Dòng file</TableHead>
                  <TableHead>Mã sản phẩm</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.newProducts.map((row) => (
                  <TableRow key={`${row.rowNum}-${row.code}`}>
                    <TableCell className="tabular-nums">{row.rowNum || '—'}</TableCell>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <p className="mb-2 text-xs text-muted-foreground">
            Các nhà cung cấp chưa có trong hệ thống đã được tạo mới khi import.
          </p>
          <div className="overflow-hidden rounded-lg border">
            <Table wrapperClassName="h-auto max-h-72">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Dòng file</TableHead>
                  <TableHead>Mã NCC</TableHead>
                  <TableHead>Tên NCC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.newVendors.map((row) => (
                  <TableRow key={`${row.rowNum}-${row.code}`}>
                    <TableCell className="tabular-nums">{row.rowNum || '—'}</TableCell>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-3">
          <MessageListPanel
            title="Dòng cần kiểm tra"
            description="Không chặn tạo đơn, nhưng nên xem lại thông tin."
            lines={summary.warnings}
            tone="warning"
            onCopy={copyText}
          />
          <MessageListPanel
            title="Lỗi cần sửa"
            description="Các dòng này không tạo được đơn hàng."
            lines={summary.errors}
            tone="error"
            onCopy={copyText}
          />
          {hasIssues && (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => void copyText('Danh sách cần xử lý', [...summary.warnings, ...summary.errors])}
              >
                <Copy className="h-3.5 w-3.5" />
                Sao chép tất cả
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
