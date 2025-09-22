import { QUERIES } from "@/lib/constants"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { IRequestPaginationAndSearch } from "@/types/api"
import { createOrder, deleteOrder, getAllOrders, getOrderById } from "@/services/order"
import { IOrderCreateRequest } from "@/types/order"


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

export const useGetOrderById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_ORDER],
        mutationFn: async (id: string) => {
            return await getOrderById(id)
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