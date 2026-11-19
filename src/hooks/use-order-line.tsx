import { QUERIES } from "@/lib/constants"
import { useToast } from "./use-toast"
import { useMutation } from "@tanstack/react-query"
import { IOrderLineCreateRequest, IOrderUpdateRequest } from "@/types/order"
import { createOrderLine, deleteOrderLine, updateOrderLine } from "@/services/order-line"
import { getApiErrorMessage } from '@/lib/api-error'



export const useCreateOrderLine = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_ORDER_LINE],
        mutationFn: async (payload: { orderLines: IOrderLineCreateRequest[], orderId: string }) => {
            return await createOrderLine(payload.orderLines, payload.orderId)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
    })

    return mutation
}

export const useUpdateOrderLine = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_ORDER_DETAIL],
        mutationFn: async (payload: { orderLines: IOrderUpdateRequest[], orderId: string }) => {
            return await updateOrderLine(payload.orderLines, payload.orderId)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
    })

    return mutation
}

export const useDeleteOrderLine = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.DELETE_ORDER_DETAIL],
        mutationFn: async (payload: { orderId: string, ids: string[] }) => {
            return await deleteOrderLine(payload.orderId, payload.ids)
        },
        onError(error: Error) {
            toast({
                variant: "destructive",
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
    })

    return mutation
}