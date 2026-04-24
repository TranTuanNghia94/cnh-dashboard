import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { downloadFromUrl, downloadLocalFile, formatPaymentFileSize } from '@/lib/payment-files'
import { Download, Eye, FileText, Paperclip, Upload, X } from 'lucide-react'
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

/**
 * @deprecated prefer `PaymentPaperUploadButton` placed inside a list panel header.
 * Kept for backwards compatibility.
 */
export function PaymentPaperDropzone({ disabled = false, onUpload, compact = false }: PaymentPaperDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const minH = compact ? 'min-h-[64px]' : 'min-h-[80px]'
  const pad = compact ? 'p-2' : 'p-2.5'

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
        className={`flex h-full flex-1 cursor-pointer flex-row items-center justify-center gap-2 rounded-md border border-dashed ${pad} transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        } ${disabled ? 'pointer-events-none opacity-50' : ''} ${minH}`}
      >
        <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="text-left leading-tight">
          <p className="text-[11px] font-medium">Kéo thả hoặc bấm để chọn</p>
          <p className="text-[10px] text-muted-foreground">Hỗ trợ nhiều file</p>
        </div>
      </div>
    </div>
  )
}

export type PaymentPaperUploadButtonProps = {
  disabled?: boolean
  onUpload: (files: FileList | null) => void
  label?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'xs'
  className?: string
}

/** Compact inline upload button that opens a native file picker. */
export function PaymentPaperUploadButton({
  disabled = false,
  onUpload,
  label = 'Tải file',
  variant = 'outline',
  size = 'sm',
  className,
}: PaymentPaperUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          onUpload(e.target.files)
          e.target.value = ''
        }}
        disabled={disabled}
      />
      <Button
        type="button"
        size={size === 'xs' ? 'sm' : size}
        variant={variant}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(size === 'xs' ? 'h-6 gap-1 px-2 text-[11px]' : 'gap-1.5', className)}
      >
        <Upload className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        {label}
      </Button>
    </>
  )
}

export type PaymentPaperFileListPanelProps = {
  title?: string
  disabled?: boolean
  onRemove?: (index: number) => void
  sources: PaymentPaperSource[]
  emptyHint?: string
  readOnly?: boolean
  /** When provided, shows an inline "Tải file" button in the header and enables silent drag-drop on the body. */
  onUpload?: (files: FileList | null) => void
  uploadLabel?: string
}

export function PaymentPaperFileListPanel({
  title = 'Danh sách file',
  disabled = false,
  onRemove = () => {},
  sources,
  emptyHint = 'Chưa có file.',
  readOnly = false,
  onUpload,
  uploadLabel = 'Tải file',
}: PaymentPaperFileListPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const canUpload = Boolean(onUpload) && !readOnly && !disabled

  return (
    <div
      onDragOver={canUpload ? (e) => { e.preventDefault(); setIsDragging(true) } : undefined}
      onDragLeave={canUpload ? (e) => { e.preventDefault(); setIsDragging(false) } : undefined}
      onDrop={canUpload ? (e) => { e.preventDefault(); setIsDragging(false); onUpload?.(e.dataTransfer.files) } : undefined}
      className={cn(
        'flex min-h-0 flex-1 flex-col rounded-md border bg-background transition-colors',
        readOnly && 'bg-muted/10',
        isDragging && 'border-primary bg-primary/5',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-2 py-1">
        <p className="truncate text-[10px] font-medium text-muted-foreground">
          {title}
          {sources.length > 0 ? ` (${sources.length})` : ''}
        </p>
        {canUpload && (
          <PaymentPaperUploadButton size="xs" variant="ghost" onUpload={onUpload!} label={uploadLabel} disabled={disabled} />
        )}
      </div>
      {sources.length === 0 ? (
        <div className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-center text-[11px] text-muted-foreground">
          <Paperclip className="h-3.5 w-3.5 opacity-60" />
          <span>{emptyHint}</span>
          {canUpload && <span className="text-[10px] opacity-70">Bấm &quot;{uploadLabel}&quot; hoặc kéo thả file vào đây</span>}
        </div>
      ) : (
        <ul className="max-h-[min(200px,40vh)] flex-1 space-y-1 overflow-y-auto p-1.5">
          {sources.map((src, index) => {
            if (src.kind === 'file') {
              const { file } = src
              return (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-1.5 rounded-md border bg-muted/20 px-1.5 py-1"
                >
                  <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium leading-tight">{file.name}</p>
                    <p className="text-[9px] leading-tight text-muted-foreground">
                      {formatPaymentFileSize(file.size)}
                      {file.type ? ` · ${file.type}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      title="Xem"
                      onClick={() =>
                        window.open(URL.createObjectURL(file), '_blank', 'noopener,noreferrer')
                      }
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      title="Tải xuống"
                      onClick={() => downloadLocalFile(file)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {!readOnly && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
                className="flex items-center gap-1.5 rounded-md border bg-muted/20 px-1.5 py-1"
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium leading-tight">{fileName}</p>
                  <p className="text-[9px] leading-tight text-muted-foreground">
                    {formatPaymentFileSize(size)}
                    {contentType ? ` · ${contentType}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    title="Xem"
                    disabled={!canOpen}
                    onClick={() => window.open(viewUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    title="Tải xuống"
                    disabled={!canOpen}
                    onClick={() => downloadFromUrl(viewUrl, fileName)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  {!readOnly && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
  emptyPaperListHint = 'Chưa có chứng từ',
  bankNoteExistingSources,
  bankNotePendingSources,
  onRemoveBankNotePending,
  emptyBankNoteColumnHint = 'Chưa có bank note',
}: PaymentPaperUploadSectionProps) {
  const hasAnyBankNote = bankNoteExistingSources.length > 0 || bankNotePendingSources.length > 0
  const paperDisabled = disabled || papersLocked
  const bankNoteDropDisabled = disabled || bankNotesLocked

  return (
    <section className="space-y-2 rounded-md border bg-muted/30 p-2">
      <Label className="text-[11px] font-semibold">{sectionTitle}</Label>

      <div className={cn('grid grid-cols-1 gap-2 lg:items-stretch', showBankNoteUpload ? 'lg:grid-cols-2' : 'lg:grid-cols-1')}>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Chứng từ</p>
          <PaymentPaperFileListPanel
            title="Danh sách"
            disabled={paperDisabled}
            readOnly={papersLocked}
            onRemove={onRemovePaper}
            sources={paperSources}
            emptyHint={emptyPaperListHint}
            onUpload={papersLocked ? undefined : onUploadPapers}
            uploadLabel="Tải chứng từ"
          />
        </div>

        {showBankNoteUpload && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Bank note (đã thanh toán)</p>
            {!hasAnyBankNote ? (
              <PaymentPaperFileListPanel
                title="Danh sách"
                sources={[]}
                emptyHint={emptyBankNoteColumnHint}
                onUpload={bankNotesLocked ? undefined : onUploadBankNotes}
                uploadLabel="Tải bank note"
                disabled={bankNoteDropDisabled}
              />
            ) : (
              <div className="flex min-h-[10px] flex-1 flex-col gap-1.5 overflow-hidden rounded-md border bg-background p-1.5">
                {bankNoteExistingSources.length > 0 && (
                  <PaymentPaperFileListPanel
                    title="Đã lưu"
                    sources={bankNoteExistingSources}
                    readOnly
                    emptyHint="—"
                  />
                )}
                <PaymentPaperFileListPanel
                  title="Chờ tải lên"
                  disabled={bankNoteDropDisabled}
                  onRemove={onRemoveBankNotePending}
                  sources={bankNotePendingSources}
                  emptyHint="Chưa có file chờ tải lên"
                  onUpload={bankNotesLocked ? undefined : onUploadBankNotes}
                  uploadLabel="Thêm bank note"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
