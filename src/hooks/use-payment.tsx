import { QUERIES } from "@/lib/constants"
import { createOrUpdatePaymentRequest, getAllPayments, getPaymentRequestById } from "@/services/payment"
import { IPaginationAndSearch, IRequestPaginationAndSearch } from "@/types/api"
import { ICreateOrUpdatePaymentRequest, IPaymentRequestInfo } from "@/types/payment"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetPayments = () => {
    const { toast } = useToast()
    
    const mutation = useMutation({
        mutationKey: [QUERIES.PAYMENT],
        mutationFn: async (payload?: IPaginationAndSearch<IPaymentRequestInfo, unknown>) => {
            return await getAllPayments(payload as unknown as IRequestPaginationAndSearch)
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

export const useCreateOrUpdatePaymentRequest = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.CREATE_OR_UPDATE_PAYMENT],
        mutationFn: async (payload: ICreateOrUpdatePaymentRequest) => {
            return await createOrUpdatePaymentRequest(payload)
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })
}

export const useGetPaymentRequestById = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.GET_PAYMENT_BY_ID],
        mutationFn: async (id: string) => {
            return await getPaymentRequestById(id)
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Có lỗi xảy ra",
                description: error.message,
            })
        },
    })
}