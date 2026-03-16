import { QUERIES } from "@/lib/constants"
import { createVendor, deleteVendor, getAllVendors, getVendorById, updateVendor, uploadFileVendor } from "@/services/vendor"
import { IRequestPaginationAndSearch } from "@/types/api"
import { IVendorCreateRequest, IVendorUpdateRequest} from "@/types/vendor"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetVendors = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.VENDORS],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllVendors(payload)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })

    return mutation
}

export const useGetVendorById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_VENDOR],
        mutationFn: async (id: string) => {
            return await getVendorById(id)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })

    return mutation
}


export const useCreateVendor = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_VENDOR],
        mutationFn: async (payload: IVendorCreateRequest) => {
            return await createVendor(payload)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })

    return mutation
}

export const useUpdateVendor = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_VENDOR],
        mutationFn: async (payload: IVendorUpdateRequest) => {
            return await updateVendor(payload)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })

    return mutation
}


export const useDeleteVendor = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_VENDOR],
        mutationFn: async (id: string) => {
            return await deleteVendor(id)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })

    return mutation;
}

export const useUploadFileVendor = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPLOAD_FILE_VENDOR],
        mutationFn: async (file: File) => {
            const response = await uploadFileVendor(file)
            return response
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })
    return mutation
}