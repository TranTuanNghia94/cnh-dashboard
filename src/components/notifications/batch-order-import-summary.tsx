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
import { cn } from '@/lib/utils'
import type { IBatchOrderImportSummary } from '@/types/batch-order-import'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Copy,
  Package,
  ShoppingCart,
  XCircle,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

type BatchOrderImportSummaryViewProps = {
  summary: IBatchOrderImportSummary
}

type SummaryTone = 'success' | 'warning' | 'error'

function getSummaryTone(summary: IBatchOrderImportSummary): SummaryTone {
  if (summary.errorCount > 0) return 'error'
  if (summary.warningCount > 0) return 'warning'
  return 'success'
}

const toneConfig: Record<
  SummaryTone,
  { banner: string; icon: typeof CheckCircle2; title: string }
> = {
  success: {
    banner: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
    title: 'Import hoàn tất',
  },
  warning: {
    banner: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: AlertTriangle,
    title: 'Import hoàn tất có cảnh báo',
  },
  error: {
    banner: 'border-red-200 bg-red-50 text-red-900',
    icon: XCircle,
    title: 'Import thất bại',
  },
}

function SummaryStatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string
  value: number
  icon: typeof CheckCircle2
  highlight?: 'success' | 'warning' | 'error' | 'default'
}) {
  const highlightClass =
    highlight === 'success'
      ? 'border-emerald-200 bg-emerald-50/80'
      : highlight === 'warning'
        ? 'border-amber-200 bg-amber-50/80'
        : highlight === 'error'
          ? 'border-red-200 bg-red-50/80'
          : 'border-border bg-card'

  return (
    <div className={cn('rounded-lg border p-3', highlightClass)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 shrink-0 opacity-60" />
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function MessageListPanel({
  title,
  lines,
  tone,
  onCopy,
}: {
  title: string
  lines: string[]
  tone: 'warning' | 'error'
  onCopy: (label: string, lines: string[]) => void
}) {
  if (!lines.length) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        Không có {title.toLowerCase()}.
      </div>
    )
  }

  const panelClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50/50'
      : 'border-red-200 bg-red-50/50'

  return (
    <div className={cn('rounded-lg border', panelClass)}>
      <div className="flex items-center justify-between gap-2 border-b border-inherit px-3 py-2">
        <p className="text-sm font-medium">
          {title} <span className="text-muted-foreground">({lines.length})</span>
        </p>
        <Button type="button" size="sm" variant="outline" className="h-7 gap-1" onClick={() => onCopy(title, lines)}>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </div>
      <ul className="max-h-64 divide-y overflow-y-auto">
        {lines.map((line, index) => (
          <li key={`${index}-${line.slice(0, 24)}`} className="flex gap-2 px-3 py-2 text-xs leading-relaxed">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-muted-foreground">{index + 1}.</span>
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

  const defaultTab = useMemo(() => {
    if (summary.ordersCreated.length > 0) return 'orders'
    if (summary.newProducts.length > 0) return 'products'
    if (summary.newVendors.length > 0) return 'vendors'
    if (summary.warnings.length > 0 || summary.errors.length > 0) return 'issues'
    return 'overview'
  }, [summary])

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

  return (
    <div className="space-y-4">
      <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3', config.banner)}>
        <StatusIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 space-y-0.5">
          <p className="font-semibold">{config.title}</p>
          <p className="text-sm opacity-90">
            {summary.totalRows} dòng · {summary.ordersCreatedCount} đơn tạo
            {summary.warningCount > 0 ? ` · ${summary.warningCount} cảnh báo` : ''}
            {summary.errorCount > 0 ? ` · ${summary.errorCount} lỗi` : ''}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">
            Tổng quan
          </TabsTrigger>
          {summary.ordersCreated.length > 0 && (
            <TabsTrigger value="orders" className="text-xs">
              Đơn hàng
              <CountBadge count={summary.ordersCreated.length} />
            </TabsTrigger>
          )}
          {summary.newProducts.length > 0 && (
            <TabsTrigger value="products" className="text-xs">
              SP mới
              <CountBadge count={summary.newProducts.length} />
            </TabsTrigger>
          )}
          {summary.newVendors.length > 0 && (
            <TabsTrigger value="vendors" className="text-xs">
              NCC mới
              <CountBadge count={summary.newVendors.length} />
            </TabsTrigger>
          )}
          {(summary.warnings.length > 0 || summary.errors.length > 0) && (
            <TabsTrigger value="issues" className="text-xs">
              Vấn đề
              <CountBadge count={summary.warningCount + summary.errorCount} />
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SummaryStatCard label="Tổng dòng" value={summary.totalRows} icon={Package} />
            <SummaryStatCard
              label="Đơn tạo"
              value={summary.ordersCreatedCount}
              icon={ShoppingCart}
              highlight="success"
            />
            <SummaryStatCard label="SP mới" value={summary.newProductsCount} icon={Package} />
            <SummaryStatCard label="NCC mới" value={summary.newVendorsCount} icon={Building2} />
            <SummaryStatCard
              label="Cảnh báo"
              value={summary.warningCount}
              icon={AlertTriangle}
              highlight={summary.warningCount > 0 ? 'warning' : 'default'}
            />
            <SummaryStatCard
              label="Lỗi"
              value={summary.errorCount}
              icon={XCircle}
              highlight={summary.errorCount > 0 ? 'error' : 'default'}
            />
          </div>

          {summary.ordersCreated.length > 0 && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Đơn mới nhất</p>
              <ul className="space-y-1.5">
                {summary.ordersCreated.slice(0, 5).map((order) => (
                  <li key={order.orderId || order.orderCode} className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      to="/order/$orderId"
                      params={{ orderId: order.orderCode }}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderCode}
                    </Link>
                    <span className="text-xs text-muted-foreground">{order.lineCount} dòng</span>
                  </li>
                ))}
              </ul>
              {summary.ordersCreated.length > 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto px-0"
                  onClick={() => setActiveTab('orders')}
                >
                  Xem tất cả {summary.ordersCreated.length} đơn
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <div className="overflow-hidden rounded-lg border">
            <Table wrapperClassName="h-auto max-h-72">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Hợp đồng</TableHead>
                  <TableHead>Mã KH</TableHead>
                  <TableHead className="text-right">Dòng</TableHead>
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
          <div className="overflow-hidden rounded-lg border">
            <Table wrapperClassName="h-auto max-h-72">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Dòng</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
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
          <div className="overflow-hidden rounded-lg border">
            <Table wrapperClassName="h-auto max-h-72">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Dòng</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên</TableHead>
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
          <MessageListPanel title="Cảnh báo" lines={summary.warnings} tone="warning" onCopy={copyText} />
          <MessageListPanel title="Lỗi" lines={summary.errors} tone="error" onCopy={copyText} />
          {(summary.warnings.length > 0 || summary.errors.length > 0) && (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => void copyText('Cảnh báo + Lỗi', [...summary.warnings, ...summary.errors])}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy tất cả
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
