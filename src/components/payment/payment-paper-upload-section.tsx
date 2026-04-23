import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { downloadFromUrl, downloadLocalFile, formatPaymentFileSize } from '@/lib/payment-files'
import { Download, Eye, FileText, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'

/** Pending upload row (update flow). */
export type PaymentPaperSourceFile = { kind: 'file'; file: File }

/** Already has a URL — e.g. create flow with blob or server `fileUrl`. */
export type PaymentPaperSourceMeta = {
  kind: 'meta'
  fileName: string
  fileUrl: string
  viewUrl: string
  size: number
  contentType: string
}

export type PaymentPaperSource = PaymentPaperSourceFile | PaymentPaperSourceMeta

export type PaymentPaperDropzoneProps = {
  disabled?: boolean
  onUpload: (files: FileList | null) => void
  /** Smaller dropzone for second upload in column 1. */
  compact?: boolean
}

export function PaymentPaperDropzone({ disabled = false, onUpload, compact = false }: PaymentPaperDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const minH = compact ? 'min-h-[100px]' : 'min-h-[120px]'
  const pad = compact ? 'p-4' : 'p-5'

  return (
    <div className={`flex flex-col ${minH}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          onUpload(e.target.files)
          e.target.value = ''
        }}
        disabled={disabled}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          onUpload(e.dataTransfer.files)
        }}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed ${pad} transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        } ${disabled ? 'pointer-events-none opacity-50' : ''} ${minH}`}
      >
        <Upload className={compact ? 'h-5 w-5 text-muted-foreground' : 'h-6 w-6 text-muted-foreground'} />
        <div className="text-center">
          <p className={compact ? 'text-[11px] font-medium' : 'text-xs font-medium'}>Kéo thả file vào đây</p>
          <p className="text-[11px] text-muted-foreground">hoặc bấm để chọn</p>
        </div>
      </div>
    </div>
  )
}

export type PaymentPaperFileListPanelProps = {
  title?: string
  disabled?: boolean
  onRemove?: (index: number) => void
  sources: PaymentPaperSource[]
  emptyHint?: string
  readOnly?: boolean
}

export function PaymentPaperFileListPanel({
  title = 'Danh sách file',
  disabled = false,
  onRemove = () => {},
  sources,
  emptyHint = 'Chưa có file.',
  readOnly = false,
}: PaymentPaperFileListPanelProps) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col rounded-lg border bg-background ${readOnly ? 'bg-muted/10' : ''}`}>
      <div className="border-b px-3 py-2">
        <p className="text-[11px] font-medium text-muted-foreground">
          {title}
          {sources.length > 0 ? ` (${sources.length})` : ''}
        </p>
      </div>
      {sources.length === 0 ? (
        <div className="flex min-h-[72px] flex-1 items-center justify-center px-3 py-4 text-center text-xs text-muted-foreground">
          {emptyHint}
        </div>
      ) : (
        <ul className="max-h-[min(280px,45vh)] flex-1 space-y-1.5 overflow-y-auto p-2">
          {sources.map((src, index) => {
            if (src.kind === 'file') {
              const { file } = src
              return (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-2 rounded-md border bg-muted/20 px-2 py-1.5"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPaymentFileSize(file.size)}
                      {file.type ? ` · ${file.type}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title="Xem"
                      onClick={() =>
                        window.open(URL.createObjectURL(file), '_blank', 'noopener,noreferrer')
                      }
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title="Tải xuống"
                      onClick={() => downloadLocalFile(file)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {!readOnly && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        title="Xóa"
                        onClick={() => onRemove(index)}
                        disabled={disabled}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </li>
              )
            }
            const { fileName, size, contentType, viewUrl } = src
            const canOpen = Boolean(viewUrl?.trim())
            return (
              <li
                key={`${fileName}-${size}-${index}`}
                className="flex items-center gap-2 rounded-md border bg-muted/20 px-2 py-1.5"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">{fileName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatPaymentFileSize(size)}
                    {contentType ? ` · ${contentType}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    title="Xem"
                    disabled={!canOpen}
                    onClick={() => window.open(viewUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    title="Tải xuống"
                    disabled={!canOpen}
                    onClick={() => downloadFromUrl(viewUrl, fileName)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {!readOnly && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      title="Xóa"
                      onClick={() => onRemove(index)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export type PaymentPaperUploadSectionProps = {
  disabled?: boolean
  /** When true, paper dropzone and removing pending papers are disabled (column 1–2 chứng từ). */
  papersLocked?: boolean
  /** When true, bank note dropzone in column 1 is disabled. */
  bankNotesLocked?: boolean
  onUploadPapers: (files: FileList | null) => void
  onRemovePaper: (index: number) => void
  paperSources: PaymentPaperSource[]
  /** Second upload in column 1 (bank note). Hidden when false (e.g. create payment). */
  showBankNoteUpload?: boolean
  onUploadBankNotes: (files: FileList | null) => void
  sectionTitle?: string
  emptyPaperListHint?: string
  /** Column 3: saved bank-note files (read-only). */
  bankNoteExistingSources: PaymentPaperSource[]
  /** Column 3: pending bank-note files (removable). */
  bankNotePendingSources: PaymentPaperSource[]
  onRemoveBankNotePending: (index: number) => void
  emptyBankNoteColumnHint?: string
}

export function PaymentPaperUploadSection({
  disabled = false,
  papersLocked = false,
  bankNotesLocked = false,
  onUploadPapers,
  onRemovePaper,
  paperSources,
  showBankNoteUpload = true,
  onUploadBankNotes,
  sectionTitle = 'Chứng từ kèm theo',
  emptyPaperListHint = 'Chưa có chứng từ. Tải file ở cột đầu (mục Chứng từ).',
  bankNoteExistingSources,
  bankNotePendingSources,
  onRemoveBankNotePending,
  emptyBankNoteColumnHint = 'Chưa có bank note. Tải file ở cột đầu (mục Bank note).',
}: PaymentPaperUploadSectionProps) {
  const hasAnyBankNote = bankNoteExistingSources.length > 0 || bankNotePendingSources.length > 0
  const paperDisabled = disabled || papersLocked
  const bankNoteDropDisabled = disabled || bankNotesLocked

  return (
    <section className="space-y-3 rounded-md border bg-muted/30 p-3">
      <Label className="text-xs font-semibold">{sectionTitle}</Label>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-stretch">
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Chứng từ</p>
            <PaymentPaperDropzone disabled={paperDisabled} onUpload={onUploadPapers} />
          </div>
          <hr />
          {showBankNoteUpload && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Bank note</p>
              <PaymentPaperDropzone disabled={bankNoteDropDisabled} onUpload={onUploadBankNotes} compact />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">Chứng từ</p>
          <PaymentPaperFileListPanel
            title="Danh sách"
            disabled={paperDisabled}
            readOnly={papersLocked}
            onRemove={onRemovePaper}
            sources={paperSources}
            emptyHint={emptyPaperListHint}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">Bank note (đã thanh toán)</p>
          <div className="flex min-h-[10px] flex-1 flex-col gap-2 overflow-hidden rounded-lg border bg-background p-2">
            {!hasAnyBankNote ? (
              <div className="flex flex-1 items-center justify-center px-2 py-6 text-center text-xs text-muted-foreground">
                {emptyBankNoteColumnHint}
              </div>
            ) : (
              <>
                {bankNoteExistingSources.length > 0 && (
                  <PaymentPaperFileListPanel
                    title="Đã lưu"
                    sources={bankNoteExistingSources}
                    readOnly
                    emptyHint="—"
                  />
                )}
                {bankNotePendingSources.length > 0 && (
                  <PaymentPaperFileListPanel
                    title="Chờ tải lên"
                    disabled={bankNoteDropDisabled}
                    onRemove={onRemoveBankNotePending}
                    sources={bankNotePendingSources}
                    emptyHint="—"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
