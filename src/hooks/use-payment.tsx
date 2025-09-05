import { QUERIES } from "@/lib/constants"
import { getAllPayments } from "@/services/payment"
import { IPaginationAndSearch } from "@/types/api"
import { IPaymentRequest, IPaymentWhere } from "@/types/payment"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetPayments = () => {
    const { toast } = useToast()
    
    const mutation = useMutation({
        mutationKey: [QUERIES.PAYMENT],
        mutationFn: async (payload?: IPaginationAndSearch<IPaymentWhere, unknown>) => {
            const request: IPaymentRequest = {
                include: {
                    CreatedBy: true,
                    ThanhToanCho: true,
                },
                ...payload,
            }

            if (payload?.orderBy) {
                request.orderBy = payload.orderBy
            }

            return await getAllPayments(request)
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        }
    })

    return mutation
}