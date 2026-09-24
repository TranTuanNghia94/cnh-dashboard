import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useCreateExportJob } from '@/hooks/use-export-job'
import { EXPORT_JOB_TYPE_LABELS } from '@/lib/export-job'
import type { ExportJobType } from '@/types/export-job'

type ExportJobButtonProps = {
  type: ExportJobType
  label?: string
}

export function ExportJobButton({ type, label = 'Xuất file' }: ExportJobButtonProps) {
  const { mutate, isPending, variables } = useCreateExportJob()
  const [open, setOpen] = useState(false)
  const isExportingThisType = isPending && variables === type
  const listName = EXPORT_JOB_TYPE_LABELS[type]

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        type="button"
        className="gap-1.5"
        disabled={isExportingThisType}
        onClick={() => setOpen(true)}
        title={`Xuất Excel ${listName}`}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isExportingThisType ? 'Đang tạo...' : label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xuất toàn bộ dữ liệu</AlertDialogTitle>
            <AlertDialogDescription>
              File Excel {listName} gồm mọi bản ghi. Bạn sẽ nhận thông báo khi file sẵn sàng để tải xuống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={() => mutate(type)}>Xuất Excel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
