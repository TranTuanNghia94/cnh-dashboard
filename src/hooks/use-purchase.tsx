import { QUERIES } from "@/lib/constants"
import { createPurchaseOrder, getAllPurchases, getPurchaseById, updatePurchaseOrder } from "@/services/purchase"
import { IRequestPaginationAndSearch } from "@/types/api"
import { IPurchaseCreateRequest } from "@/types/purchase"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetPurchases = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.PURCHASES],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllPurchases(payload)
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

export const useCreatePurchaseOrder = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_PURCHASE],
        mutationFn: async (payload: IPurchaseCreateRequest) => {
            return await createPurchaseOrder(payload)
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

export const useGetPurchaseById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.PURCHASES, 'DETAIL'],
        mutationFn: async (id: string) => {
            return await getPurchaseById(id)
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

export const useUpdatePurchaseOrder = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_PURCHASE, 'UPDATE'],
        mutationFn: async (payload: IPurchaseCreateRequest) => {
            return await updatePurchaseOrder(payload)
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
