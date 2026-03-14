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
import { useUploadFileProduct } from '@/hooks/use-product'
import { Upload } from 'lucide-react'
import React, { useState, useRef } from 'react'

type Props = {
    onUploadSuccess?: () => void
}

export const UploadProductModal = ({ onUploadSuccess }: Props) => {
    const [open, setOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { mutateAsync: uploadFile, isPending } = useUploadFileProduct()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        try {
            await uploadFile(selectedFile)
            setOpen(false)
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            onUploadSuccess?.()
        } catch {
            // Error is handled by the hook
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Product File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
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
                        disabled={!selectedFile || isPending}
                    >
                        {isPending ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}