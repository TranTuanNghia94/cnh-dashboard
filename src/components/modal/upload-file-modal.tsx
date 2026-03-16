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
import { IUploadFileResponse } from '@/types/api'
import { Upload, Copy, Check, AlertCircle } from 'lucide-react'
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

            if (response.data && response.data.totalErrors > 0) {
                setUploadResult(response.data)
            } else {
                toast({
                    variant: 'success',
                    title: 'Thao tác thành công',
                    description: successMessage || `Tải lên thành công ${response.data?.totalSuccess} ${entityName}`,
                })
                setOpen(false)
                resetState()
                onUploadSuccess?.()
            }
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
        if (!uploadResult?.errors) return

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
                        {uploadResult ? 'Kết quả tải lên' : title}
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
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-600">
                                    Thành công: {uploadResult.totalSuccess}
                                </span>
                                <span className="text-red-600">
                                    Lỗi: {uploadResult.totalErrors}
                                </span>
                                <span className="text-muted-foreground">
                                    Tổng: {uploadResult.totalRows}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        Danh sách lỗi ({uploadResult.errors.length})
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyErrors}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Đã sao chép
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Sao chép lỗi
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    <div className="space-y-2">
                                        {uploadResult.errors.map((error, index) => (
                                            <div
                                                key={index}
                                                className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800"
                                            >
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
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
