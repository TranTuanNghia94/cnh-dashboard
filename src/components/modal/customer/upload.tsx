import { UploadFileModal } from '@/components/modal/upload-file-modal'
import { uploadFileCustomer } from '@/services/customer'

type Props = {
    onUploadSuccess?: () => void
}

export const UploadCustomerModal = ({ onUploadSuccess }: Props) => {
    return (
        <UploadFileModal
            title="Upload Customer File"
            triggerText="Tải lên file"
            entityName="khách hàng"
            uploadFn={uploadFileCustomer}
            onUploadSuccess={onUploadSuccess}
        />
    )
}
