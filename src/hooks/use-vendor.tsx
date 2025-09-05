import { QUERIES } from "@/lib/constants"
import { createVendor, deleteVendor, getAllVendors, updateVendor } from "@/services/vendor"
import { IPaginationAndSearch } from "@/types/api"
import { IVendorInput, IVendorRequest, IVendorWhere } from "@/types/vendor"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetVendors = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.VENDORS],
        mutationFn: async (payload?: IPaginationAndSearch<IVendorWhere, unknown>) => {
            const request: IVendorRequest = {
                ...payload,
            }

            if (payload?.orderBy) {
                request.orderBy = payload.orderBy
            }

            return await getAllVendors(request)
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

export const useGetVendorByCode = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_VENDOR],
        mutationFn: async (code: string) => {
            const request: IVendorRequest = {
                where: {
                    maNhaCungCap: code
                }
            }
            return await getAllVendors(request)
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
        mutationFn: async (payload?: IVendorInput) => {
            const request: IVendorRequest = {
                data: payload
            }

            return await createVendor(request)
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
        mutationFn: async (payload?: IVendorInput) => {
            const request: IVendorRequest = {
                data: payload,
                where: {
                    id: payload?.id
                }
            }

            return await updateVendor(request)
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

export const useDeleteVendor = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_VENDOR],
        mutationFn: async (id: string) => {
            const request: IVendorRequest = {
                where: {
                    id: id
                }
            }

            return await deleteVendor(request)
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