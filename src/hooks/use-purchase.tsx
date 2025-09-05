import { QUERIES } from "@/lib/constants"
import { getAllPurchases } from "@/services/purchase"
import { IPaginationAndSearch } from "@/types/api"
import { IPurchaseRequest, IPurchaseWhere } from "@/types/purchase"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetPurchases = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.PURCHASES],
        mutationFn: async (payload?: IPaginationAndSearch<IPurchaseWhere, unknown>) => {
            const request: IPurchaseRequest = {
                ...payload,
            }

            if (payload?.orderBy) {
                request.orderBy = payload.orderBy
            }

            return await getAllPurchases(request)
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