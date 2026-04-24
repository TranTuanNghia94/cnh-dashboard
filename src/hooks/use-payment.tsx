import { QUERIES } from "@/lib/constants"
import { approvePaymentRequest, createOrUpdatePaymentRequest, getAllPayments, getPaymentRequestById, getPaymentRequestFiles, getPOLinePaymentHistory, rejectPaymentRequest, sendPaymentRequestToAccountant, uploadPaymentRequestFile } from "@/services/payment"
import { IPaginationAndSearch, IRequestPaginationAndSearch } from "@/types/api"
import { IApprovePaymentRequest, ICreateOrUpdatePaymentRequest, IPaymentRequestInfo, IRejectPaymentRequest, IUploadPaymentRequestFileRequest } from "@/types/payment"
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

export const useUploadPaymentRequestFile = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.UPLOAD_FILE_PAYMENT],
        mutationFn: async (payload: IUploadPaymentRequestFileRequest) => {
            return await uploadPaymentRequestFile(payload)
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


export const useGetPaymentRequestFiles = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.GET_PAYMENT_REQUEST_FILES_BY_ID],
        mutationFn: async (id: string) => {
            return await getPaymentRequestFiles(id)
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


export const useSendPaymentRequestToAccountant = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.SEND_PAYMENT_REQUEST_TO_ACCOUNTANT],
        mutationFn: async (id: string) => {
            return await sendPaymentRequestToAccountant(id)
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

export const useApprovePaymentRequest = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.APPROVE_PAYMENT_REQUEST],
        mutationFn: async ({ id, body }: { id: string; body: IApprovePaymentRequest }) => {
            return await approvePaymentRequest(id, body)
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

export const useRejectPaymentRequest = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.REJECT_PAYMENT_REQUEST],
        mutationFn: async ({ id, body }: { id: string; body: IRejectPaymentRequest }) => {
            return await rejectPaymentRequest(id, body)
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

export const useGetPOLinePaymentHistory = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.PAYMENT, 'PO_LINE_PAYMENT_HISTORY'],
        mutationFn: async (payload: { paperCode: string; paperType: string }) => {
            return await getPOLinePaymentHistory(payload)
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