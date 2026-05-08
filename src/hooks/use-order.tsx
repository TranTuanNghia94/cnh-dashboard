import { QUERIES } from "@/lib/constants"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { IRequestPaginationAndSearch } from "@/types/api"
import { createOrder, deleteOrder, getAllOrders, getOrderByCode, updateOrder, updateOrderStatus, uploadFileBatchOrder } from "@/services/order"
import { IOrderCreateRequest, IOrderUpdateStatusRequest } from "@/types/order"


export const useGetOrders = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.ORDERS],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllOrders(payload)
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

export const useGetOrderByCode = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_ORDER],
        mutationFn: async (code: string) => {
            return await getOrderByCode(code)
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

export const useCreateOrder = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_ORDER],
        mutationFn: async (payload?: IOrderCreateRequest) => {
            return await createOrder(payload)
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

export const useDeleteOrder = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.DELETE_ORDER],
        mutationFn: async (id: string) => {
            return await deleteOrder(id)
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

export const useUpdateOrder = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_ORDER],
        mutationFn: async (payload?: IOrderCreateRequest) => {
            return await updateOrder(payload)
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

export const useUpdateOrderStatus = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_ORDER_STATUS],
        mutationFn: async (payload: IOrderUpdateStatusRequest) => {
            return await updateOrderStatus(payload)
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

export const useUploadFileBatchOrder = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPLOAD_FILE_BATCH_ORDER],
        mutationFn: async (file: File) => {
            const response = await uploadFileBatchOrder(file)
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