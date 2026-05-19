import type { IUploadFileResponse } from '@/types/api'

/** Product / customer / vendor Excel import — not batch order (no importSummary). */
function uploadWarnings(data: IUploadFileResponse): string[] {
  return data.warnings ?? []
}

export function hasUploadIssues(data: IUploadFileResponse): boolean {
  return data.totalErrors > 0 || data.errors.length > 0 || uploadWarnings(data).length > 0
}

export function getUploadResultDialogTitle(data: IUploadFileResponse): string {
  if (data.totalSuccess === 0 && data.totalErrors > 0) {
    return 'Tải lên không thành công'
  }
  if (data.totalSuccess > 0 && data.totalErrors > 0) {
    return 'Tải lên xong — còn lỗi cần sửa'
  }
  if (uploadWarnings(data).length > 0) {
    return 'Tải lên xong — cần kiểm tra thêm'
  }
  return 'Kết quả tải lên'
}

export function getUploadResultSummaryMessage(data: IUploadFileResponse): string | null {
  if (data.message?.trim()) return data.message.trim()

  if (data.totalSuccess > 0 && data.totalErrors > 0) {
    return `${data.totalSuccess} dòng đã được nhập; ${data.totalErrors} dòng lỗi cần sửa và tải lại.`
  }
  if (data.totalSuccess > 0 && data.totalErrors === 0) {
    return `Đã nhập thành công ${data.totalSuccess} dòng.`
  }
  return null
}

/** Backend row errors often look like "Row 12: ..." */
export function parseUploadErrorRow(error: string): number | null {
  const match = /^Row\s+(\d+)\s*:/i.exec(error.trim())
  if (!match) return null
  const row = Number.parseInt(match[1], 10)
  return Number.isFinite(row) ? row : null
}

export type UploadErrorKind = 'duplicate-in-file' | 'already-exists' | 'other'

export function getUploadErrorKind(error: string): UploadErrorKind {
  if (/duplicate .+ in file/i.test(error)) return 'duplicate-in-file'
  if (/already exists/i.test(error)) return 'already-exists'
  return 'other'
}

export function getUploadErrorKindLabel(kind: UploadErrorKind): string | null {
  switch (kind) {
    case 'duplicate-in-file':
      return 'Trùng trong file'
    case 'already-exists':
      return 'Đã tồn tại'
    default:
      return null
  }
}
