import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUploadFileBatchOrderAsync } from '@/hooks/use-order'
import { useToast } from '@/hooks/use-toast'
import { downloadBatchOrderExcelTemplate } from '@/lib/order-lines-excel'
import { ChangeEvent, useCallback, useRef, useState } from 'react'

type OrderBatchUploadModalProps = {
  triggerLabel?: string
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  onUploaded?: () => Promise<void> | void
}

export default function OrderBatchUploadModal({
  triggerLabel = 'Upload file',
  triggerVariant = 'outline',
  triggerSize = 'sm',
  onUploaded,
}: OrderBatchUploadModalProps) {
  const { mutateAsync: uploadBatchOrderFile } = useUploadFileBatchOrderAsync()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [uploadFileName, setUploadFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const selectedUploadFileRef = useRef<File | null>(null)
  const isUploadingRef = useRef(false)

  const handleOpen = useCallback(() => {
    selectedUploadFileRef.current = null
    setUploadFileName('')
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    selectedUploadFileRef.current = null
    setUploadFileName('')
    isUploadingRef.current = false
    setIsUploading(false)
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
    if (isUploadingRef.current) return

    const file = selectedUploadFileRef.current
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Thiếu file',
        description: 'Vui lòng chọn file Excel trước khi tải lên.',
      })
      return
    }

    isUploadingRef.current = true
    setIsUploading(true)

    try {
      await uploadBatchOrderFile(file)

      toast({
        title: 'Tải file lên thành công',
        description: 'Hệ thống đang xử lý file. Bạn sẽ nhận thông báo khi hoàn tất.',
        variant: 'success',
      })

      handleClose()
      await onUploaded?.()
    } catch {
      // Error toast is handled by useUploadFileBatchOrderAsync
    } finally {
      isUploadingRef.current = false
      setIsUploading(false)
    }
  }, [handleClose, onUploaded, toast, uploadBatchOrderFile])

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
                disabled={isUploading}
                className="block text-sm disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadFileName ? `Đã chọn: ${uploadFileName}` : 'Chưa chọn file.'}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Hủy
            </Button>
            <Button type="button" onClick={() => void handleUpload()} disabled={isUploading}>
              {isUploading ? 'Đang upload...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
