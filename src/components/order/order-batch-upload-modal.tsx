import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUploadFileBatchOrder } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { downloadBatchOrderExcelTemplate } from '@/lib/order-lines-excel'
import { ChangeEvent, useCallback, useRef, useState } from 'react'

type OrderBatchUploadModalProps = {
  triggerLabel?: string
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  onUploaded?: () => Promise<void> | void
}

type UploadDetails = {
  title: string
  message: string
  warnings: string[]
  errors: string[]
}

const asStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') return JSON.stringify(item)
      return String(item ?? '')
    })
    .filter(Boolean)
}

export default function OrderBatchUploadModal({
  triggerLabel = 'Upload file',
  triggerVariant = 'outline',
  triggerSize = 'sm',
  onUploaded,
}: OrderBatchUploadModalProps) {
  const { mutateAsync: uploadBatchOrderFile, isPending: isUploadingBatchOrderFile } = useUploadFileBatchOrder()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [uploadFileName, setUploadFileName] = useState('')
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const selectedUploadFileRef = useRef<File | null>(null)

  const handleOpen = useCallback(() => {
    selectedUploadFileRef.current = null
    setUploadFileName('')
    setUploadDetails(null)
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    selectedUploadFileRef.current = null
    setUploadFileName('')
    setUploadDetails(null)
    if (uploadInputRef.current) {
      uploadInputRef.current.value = ''
    }
  }, [])

  const handleSelectUploadFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    selectedUploadFileRef.current = file ?? null
    setUploadFileName(file?.name ?? '')
  }, [])

  const handleUpload = useCallback(async () => {
    const file = selectedUploadFileRef.current
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Thiếu file',
        description: 'Vui lòng chọn file Excel trước khi tải lên.',
      })
      return
    }

    try {
      const response = await uploadBatchOrderFile(file)
      const payload = response?.data as Record<string, unknown> | undefined
      const warnings = asStringList(payload?.warnings)
      const errors = asStringList(payload?.errors)
      const warningsCount = warnings.length

      const createdCount = (() => {
        if (typeof payload?.createdOrderCount === 'number') return payload.createdOrderCount
        if (typeof payload?.createdCount === 'number') return payload.createdCount
        if (Array.isArray(payload?.orders)) return payload.orders.length
        if (Array.isArray(payload?.createdOrders)) return payload.createdOrders.length
        return undefined
      })()

      const messageParts: string[] = []
      if (typeof createdCount === 'number') {
        messageParts.push(`Đã tạo ${createdCount} đơn hàng`)
      }
      if (warningsCount > 0) {
        messageParts.push(`${warningsCount} cảnh báo`)
      }

      const message = messageParts.length > 0
        ? `${messageParts.join(', ')}.`
        : response?.message || 'Tải file lên thành công.'

      setUploadDetails({
        title: 'Kết quả upload',
        message,
        warnings,
        errors,
      })

      toast({
        title: 'Tải lên thành công',
        description: message,
        variant: warningsCount > 0 ? 'warning' : 'success',
      })

      await onUploaded?.()
    } catch (error) {
      const err = error as { message?: string; data?: Record<string, unknown> }
      const warnings = asStringList(err?.data?.warnings)
      const errors = asStringList(err?.data?.errors)
      const message = err?.message || 'Upload thất bại, vui lòng kiểm tra lại file.'

      setUploadDetails({
        title: 'Kết quả upload',
        message,
        warnings,
        errors,
      })
    }
  }, [onUploaded, toast, uploadBatchOrderFile])

  const copyText = useCallback(async (label: string, lines: string[]) => {
    const content = lines.join('\n')
    if (!content) return
    await navigator.clipboard.writeText(content)
    toast({
      title: 'Đã sao chép',
      description: `${label} (${lines.length} dòng)`,
      variant: 'success',
    })
  }, [toast])

  return (
    <>
      <Button size={triggerSize} variant={triggerVariant} onClick={handleOpen}>
        {triggerLabel}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload file batch order</DialogTitle>
            <DialogDescription>
              Dùng file mẫu để tạo đơn hàng hàng loạt theo đúng định dạng hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Cột bắt buộc theo mẫu: MÃ KH, SỐ HỢP ĐỒNG, NGÀY ĐẶT, MÃ SẢN PHẨM, MÃ NCC, ĐVT, SỐ LƯỢNG, ĐƠN GIÁ, BAO GỒM THUẾ.
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => downloadBatchOrderExcelTemplate()}>
                Tải mẫu Excel
              </Button>
              <input
                ref={uploadInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleSelectUploadFile}
                className="block text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadFileName ? `Đã chọn: ${uploadFileName}` : 'Chưa chọn file.'}
            </p>

            {uploadDetails && (
              <div className="space-y-2 rounded border p-3">
                <p className="text-sm font-semibold">{uploadDetails.title}</p>
                <p className="text-xs text-muted-foreground">{uploadDetails.message}</p>

                {uploadDetails.warnings.length > 0 && (
                  <div className="space-y-1 rounded border border-amber-300 bg-amber-50 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-amber-700">Warnings ({uploadDetails.warnings.length})</p>
                      <Button type="button" size="sm" variant="outline" onClick={() => void copyText('Warnings', uploadDetails.warnings)}>
                        Copy warnings
                      </Button>
                    </div>
                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs text-amber-900">
                      {uploadDetails.warnings.join('\n')}
                    </pre>
                  </div>
                )}

                {uploadDetails.errors.length > 0 && (
                  <div className="space-y-1 rounded border border-red-300 bg-red-50 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-red-700">Errors ({uploadDetails.errors.length})</p>
                      <Button type="button" size="sm" variant="outline" onClick={() => void copyText('Errors', uploadDetails.errors)}>
                        Copy errors
                      </Button>
                    </div>
                    <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs text-red-900">
                      {uploadDetails.errors.join('\n')}
                    </pre>
                  </div>
                )}

                {(uploadDetails.warnings.length > 0 || uploadDetails.errors.length > 0) && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void copyText('Warnings + Errors', [...uploadDetails.warnings, ...uploadDetails.errors])}
                    >
                      Copy all
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploadingBatchOrderFile}>
              Hủy
            </Button>
            <Button type="button" onClick={() => void handleUpload()} disabled={isUploadingBatchOrderFile}>
              {isUploadingBatchOrderFile ? 'Đang upload...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
