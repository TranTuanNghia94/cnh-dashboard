import { UploadFileModal } from '@/components/modal/upload-file-modal'
import { uploadFileVendor } from '@/services/vendor'

type Props = {
    onUploadSuccess?: () => void
}

export const UploadVendorModal = ({ onUploadSuccess }: Props) => {
    return (
        <UploadFileModal
            title="Upload Vendor File"
            triggerText="Tải lên file"
            entityName="nhà cung cấp"
            uploadFn={uploadFileVendor}
            onUploadSuccess={onUploadSuccess}
        />
    )
}
