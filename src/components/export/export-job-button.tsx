import { Button } from '@/components/ui/button'
import { useCreateExportJob } from '@/hooks/use-export-job'
import { EXPORT_JOB_TYPE_LABELS } from '@/lib/export-job'
import type { ExportJobType } from '@/types/export-job'
import { FileSpreadsheet } from 'lucide-react'

type ExportJobButtonProps = {
  type: ExportJobType
  label?: string
}

export function ExportJobButton({ type, label = 'Xuất file' }: ExportJobButtonProps) {
  const { mutate, isPending, variables } = useCreateExportJob()
  const isExportingThisType = isPending && variables === type

  return (
    <Button
      size="sm"
      variant="outline"
      type="button"
      className="gap-1.5"
      disabled={isExportingThisType}
      onClick={() => mutate(type)}
      title={`Xuất Excel ${EXPORT_JOB_TYPE_LABELS[type]}`}
    >
      <FileSpreadsheet className="h-4 w-4" />
      {isExportingThisType ? 'Đang tạo...' : label}
    </Button>
  )
}
