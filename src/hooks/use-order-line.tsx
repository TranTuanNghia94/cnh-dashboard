import { QUERIES } from "@/lib/constants"
import { useToast } from "./use-toast"
import { useMutation } from "@tanstack/react-query"
import { IOrderLineCreateRequest } from "@/types/order"
import { createOrderLine } from "@/services/order-line"



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
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })

    return mutation
}