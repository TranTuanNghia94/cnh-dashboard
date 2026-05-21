import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useExportJobsQuery } from '@/hooks/use-export-job'
import {
  EXPORT_JOB_STATUS_LABELS,
  EXPORT_JOB_STATUS_VARIANTS,
  EXPORT_JOB_TYPE_LABELS,
} from '@/lib/export-job'
import type { IExportJobResponse } from '@/types/export-job'
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react'
import moment from 'moment'

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = moment(value)
  return date.isValid() ? date.format('DD/MM/YYYY HH:mm:ss') : value
}

function ExportJobRow({ job }: { job: IExportJobResponse }) {
  const canDownload = job.status === 'SUCCESS' && Boolean(job.viewUrl)

  return (
    <TableRow>
      <TableCell className="font-medium">{EXPORT_JOB_TYPE_LABELS[job.type] ?? job.type}</TableCell>
      <TableCell>
        <Badge variant={EXPORT_JOB_STATUS_VARIANTS[job.status] ?? 'secondary'}>
          {EXPORT_JOB_STATUS_LABELS[job.status] ?? job.status}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[240px] truncate">{job.fileName || '-'}</TableCell>
      <TableCell>{job.totalRows ?? '-'}</TableCell>
      <TableCell>{formatDateTime(job.startedAt || job.finishedAt)}</TableCell>
      <TableCell className="max-w-[220px] truncate text-destructive">
        {job.status === 'FAILED' ? job.errorMessage || 'Xuất file thất bại' : ''}
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" disabled={!canDownload} asChild={canDownload}>
          {canDownload ? (
            <a href={job.viewUrl as string} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              Tải xuống
            </a>
          ) : (
            <span>Tải xuống</span>
          )}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function ExportHistoryCard() {
  const { data, isLoading, isFetching, refetch } = useExportJobsQuery({ page: 0, limit: 20 })
  const jobs = data?.data?.data ?? []

  return (
    <Card className="overflow-hidden border-muted/80 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Lịch sử xuất Excel
            </CardTitle>
            <CardDescription>
              File chỉ có thể tải xuống khi job hoàn thành và còn hiệu lực link tải.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Đang tải lịch sử xuất file...
          </div>
        ) : jobs.length ? (
          <Table wrapperClassName="h-auto max-h-[560px] rounded-xl border">
            <TableHeader>
              <TableRow>
                <TableHead>Loại dữ liệu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tên file</TableHead>
                <TableHead>Số dòng</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Lỗi</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <ExportJobRow key={job.id} job={job} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Chưa có job xuất Excel nào.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
