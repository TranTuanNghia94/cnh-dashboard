import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { downloadOrderLinesExcelTemplate, parseOrderLinesExcel } from '@/lib/order-lines-excel'
import { getProductByCode } from '@/services/product'
import { IOrderLineCreateRequest } from '@/types/order'
import { IProductResponse } from '@/types/product'
import { AlertCircle, Check, Copy, FileUp } from 'lucide-react'
import { ChangeEvent, useCallback, useRef, useState } from 'react'

type Props = {
  disabled?: boolean
  onImported: (lines: IOrderLineCreateRequest[]) => void
}

type ImportIssue = {
  rowNumber: number
  messages: string[]
}

async function findProduct(code: string): Promise<IProductResponse | undefined> {
  try {
    const response = await getProductByCode(code)
    return response?.data?.id ? response.data : undefined
  } catch {
    return undefined
  }
}

export default function OrderLineExcelUploadModal({ disabled, onImported }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [issues, setIssues] = useState<ImportIssue[]>([])
  const [headerError, setHeaderError] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)

  const reset = useCallback(() => {
    fileRef.current = null
    setFileName('')
    setIssues([])
    setHeaderError('')
    setCopied(false)
    setIsImporting(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    reset()
  }, [reset])

  const handleSelectFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    fileRef.current = file
    setFileName(file?.name ?? '')
    setIssues([])
    setHeaderError('')
  }, [])

  const handleCopyIssues = useCallback(async () => {
    const lines = [
      headerError,
      ...issues.map((issue) => `Dòng ${issue.rowNumber}: ${issue.messages.join('; ')}`),
    ].filter(Boolean)
    if (!lines.length) return
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [headerError, issues])

  const handleImport = useCallback(async () => {
    const file = fileRef.current
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Thiếu file',
        description: 'Chọn file Excel mau-chi-tiet-don-hang trước khi tải lên.',
      })
      return
    }

    setIsImporting(true)
    setIssues([])
    setHeaderError('')

    try {
      const parsed = await parseOrderLinesExcel(file)
      if (parsed.headerError) {
        setHeaderError(parsed.headerError)
        return
      }

      const productCodes = Array.from(new Set(parsed.rows.map((row) => row.productCode)))
      const products = new Map<string, IProductResponse | undefined>()
      await Promise.all(productCodes.map(async (code) => {
        products.set(code, await findProduct(code))
      }))

      const nextIssues = [...parsed.issues]
      const lines: IOrderLineCreateRequest[] = []

      parsed.rows.forEach((row) => {
        const product = products.get(row.productCode)
        if (!product?.id) {
          nextIssues.push({
            rowNumber: row.rowNumber,
            messages: [`Không tìm thấy sản phẩm theo mã "${row.productCode}"`],
          })
          return
        }

        const quantity = row.quantity
        const unitPrice = row.unitPrice
        lines.push({
          product,
          productId: product.id,
          productCodeSuggest: product.code || row.productCode,
          productNameSuggest: row.productName || product.name || '',
          vendorCodeSuggest: row.vendorCode,
          vendorNameSuggest: row.vendorCode,
          quantity,
          unitPrice,
          uom: row.uom || product.unit1 || '',
          isIncludedTax: row.isIncludedTax,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: quantity * unitPrice,
          notes: row.notes,
          receiverNote: row.receiverNote,
          deliveryNote: row.deliveryNote,
          referenceNote: row.referenceNote,
        })
      })

      nextIssues.sort((a, b) => a.rowNumber - b.rowNumber)
      if (nextIssues.length) {
        setIssues(nextIssues)
        return
      }

      onImported(lines)
      toast({
        variant: 'success',
        title: 'Đã thêm vào bảng',
        description: `${lines.length} dòng đang chờ kiểm tra. Bấm Lưu đơn hàng để ghi nhận.`,
      })
      handleClose()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Không đọc được file',
        description: 'Chọn file .xlsx đúng mẫu mau-chi-tiet-don-hang.',
      })
    } finally {
      setIsImporting(false)
    }
  }, [handleClose, onImported, toast])

  const hasErrors = Boolean(headerError) || issues.length > 0

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <FileUp className="mr-2 h-4 w-4" />
        Tải lên Excel
      </Button>

      <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose() }}>
        <DialogContent className={hasErrors ? 'max-w-2xl' : 'max-w-xl'}>
          <DialogHeader>
            <DialogTitle>Tải lên chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Dùng file mẫu mau-chi-tiet-don-hang.xlsx. Dòng hợp lệ được thêm vào bảng để kiểm tra trước khi bấm Lưu đơn hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Bắt buộc: Mã hàng, Mã NCC, Số lượng, Đơn giá, ĐVT, Gồm thuế (1 = đã gồm thuế, 0 = chưa). Tên hàng, Giáo viên, Phòng, Tham chiếu, Ghi chú là tùy chọn.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => downloadOrderLinesExcelTemplate()}>
                Tải mẫu Excel
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleSelectFile}
                disabled={isImporting}
                className="block text-sm disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {fileName ? `Đã chọn: ${fileName}` : 'Chưa chọn file.'}
            </p>

            {hasErrors && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Không thêm dòng nào. Sửa file rồi tải lại.
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => void handleCopyIssues()}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? 'Đã sao chép' : 'Sao chép lỗi'}
                  </Button>
                </div>
                <ScrollArea className="h-56 rounded-md border p-3">
                  <div className="space-y-2">
                    {headerError && (
                      <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                        {headerError}
                      </div>
                    )}
                    {issues.map((issue) => (
                      <div
                        key={issue.rowNumber}
                        className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700"
                      >
                        Dòng {issue.rowNumber}: {issue.messages.join('; ')}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isImporting}>
              Hủy
            </Button>
            <Button type="button" onClick={() => void handleImport()} disabled={isImporting || !fileName}>
              {isImporting ? 'Đang đọc file...' : 'Thêm vào bảng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
