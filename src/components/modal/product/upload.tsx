import { UploadFileModal } from '@/components/modal/upload-file-modal'
import { uploadFileProduct } from '@/services/product'

type Props = {
    onUploadSuccess?: () => void
}

export const UploadProductModal = ({ onUploadSuccess }: Props) => {
    return (
        <UploadFileModal
            title="Upload Product File"
            triggerText="Upload File"
            entityName="sản phẩm"
            uploadFn={uploadFileProduct}
            onUploadSuccess={onUploadSuccess}
        />
    )
}