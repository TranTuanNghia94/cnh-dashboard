import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
    getUploadErrorKind,
    getUploadErrorKindLabel,
    getUploadResultDialogTitle,
    getUploadResultSummaryMessage,
    hasUploadIssues,
    parseUploadErrorRow,
} from '@/lib/excel-upload-result'
import { IUploadFileResponse } from '@/types/api'
import { Upload, Copy, Check, AlertCircle, Info } from 'lucide-react'
import React, { useState, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IGenericResponse } from '@/types/other'

type UploadFileModalProps = {
    title: string
    triggerText?: string
    successMessage?: string
    entityName: string
    accept?: string
    onUploadSuccess?: () => void
    uploadFn: (file: File) => Promise<IGenericResponse<IUploadFileResponse>>
    isPending?: boolean
}

function normalizeUploadResult(data: IUploadFileResponse): IUploadFileResponse {
    return {
        ...data,
        errors: data.errors ?? [],
        warnings: data.warnings ?? [],
    }
}

export const UploadFileModal = ({
    title,
    triggerText = 'Upload File',
    successMessage,
    entityName,
    accept = '.xlsx,.xls,.csv',
    onUploadSuccess,
    uploadFn,
    isPending = false,
}: UploadFileModalProps) => {
    const [open, setOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadResult, setUploadResult] = useState<IUploadFileResponse | null>(null)
    const [copied, setCopied] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setUploadResult(null)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        try {
            const response = await uploadFn(selectedFile)
            const data = response.data ? normalizeUploadResult(response.data) : null

            if (!data) {
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: 'Không nhận được kết quả từ máy chủ',
                })
                return
            }

            if (hasUploadIssues(data)) {
                setUploadResult(data)
                if (data.totalSuccess > 0) {
                    onUploadSuccess?.()
                }
                return
            }

            toast({
                variant: 'success',
                title: 'Thao tác thành công',
                description:
                    successMessage ||
                    data.message ||
                    `Tải lên thành công ${data.totalSuccess} ${entityName}`,
            })
            setOpen(false)
            resetState()
            onUploadSuccess?.()
        } catch {
            toast({
                variant: 'destructive',
                title: 'Có lỗi xảy ra',
                description: 'Tải lên thất bại',
            })
        } finally {
            setIsUploading(false)
        }
    }

    const resetState = () => {
        setSelectedFile(null)
        setUploadResult(null)
        setCopied(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            resetState()
        }
    }

    const handleCopyErrors = async () => {
        if (!uploadResult?.errors.length) return

        const errorText = uploadResult.errors.join('\n')
        await navigator.clipboard.writeText(errorText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
            title: 'Đã sao chép',
            description: 'Danh sách lỗi đã được sao chép vào clipboard',
        })
    }

    const handleBack = () => {
        setUploadResult(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const loading = isPending || isUploading
    const resultSummary = uploadResult ? getUploadResultSummaryMessage(uploadResult) : null
    const errorCount = uploadResult
        ? Math.max(uploadResult.totalErrors, uploadResult.errors.length)
        : 0
    const warnings = uploadResult?.warnings ?? []

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent className={uploadResult ? 'max-w-2xl' : ''}>
                <DialogHeader>
                    <DialogTitle>
                        {uploadResult ? getUploadResultDialogTitle(uploadResult) : title}
                    </DialogTitle>
                </DialogHeader>

                {!uploadResult ? (
                    <>
                        <div className="grid gap-4 py-4">
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept={accept}
                                onChange={handleFileChange}
                            />
                            {selectedFile && (
                                <p className="text-sm text-muted-foreground">
                                    Đã chọn: {selectedFile.name}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Hủy</Button>
                            </DialogClose>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? 'Đang tải lên...' : 'Tải lên'}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            {resultSummary && (
                                <p className="text-sm text-muted-foreground">{resultSummary}</p>
                            )}

                            {uploadResult.totalSuccess > 0 && uploadResult.totalErrors > 0 && (
                                <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        Các dòng hợp lệ đã được nhập. Sửa các dòng lỗi trong file
                                        Excel rồi tải lên lại phần còn lại nếu cần.
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="text-green-600">
                                    Thành công: {uploadResult.totalSuccess}
                                </span>
                                <span className="text-red-600">Lỗi: {uploadResult.totalErrors}</span>
                                <span className="text-muted-foreground">
                                    Tổng: {uploadResult.totalRows}
                                </span>
                            </div>

                            {uploadResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            Danh sách lỗi ({errorCount})
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyErrors}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Đã sao chép
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Sao chép lỗi
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-[300px] rounded-md border p-4">
                                        <div className="space-y-2">
                                            {uploadResult.errors.map((error, index) => {
                                                const row = parseUploadErrorRow(error)
                                                const kindLabel = getUploadErrorKindLabel(
                                                    getUploadErrorKind(error),
                                                )
                                                return (
                                                    <div
                                                        key={index}
                                                        className="rounded border border-red-200 bg-red-50 p-2 text-sm dark:border-red-800 dark:bg-red-950"
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {row != null && (
                                                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                                                                    Dòng {row}
                                                                </span>
                                                            )}
                                                            {kindLabel && (
                                                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                                    {kindLabel}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1">{error}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {warnings.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                                        <AlertCircle className="h-4 w-4" />
                                        Cảnh báo ({warnings.length})
                                    </div>
                                    <ScrollArea className="max-h-[160px] rounded-md border p-4">
                                        <div className="space-y-2">
                                            {warnings.map((warning, index) => (
                                                <div
                                                    key={index}
                                                    className="rounded border border-amber-200 bg-amber-50 p-2 text-sm dark:border-amber-800 dark:bg-amber-950"
                                                >
                                                    {warning}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleBack}>
                                Tải lên file khác
                            </Button>
                            <DialogClose asChild>
                                <Button>Đóng</Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
