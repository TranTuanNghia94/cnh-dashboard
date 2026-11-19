import { QUERIES } from "@/lib/constants"
import { approvePaymentRequest, cancelPaymentRequest, createOrUpdatePaymentRequest, getAllPayments, getPaymentRequestById, getPaymentRequestFiles, getPOLinePaymentHistory, markPaymentPaid, rejectPaymentRequest, sendPaymentRequestToAccountant, uploadPaymentRequestFile } from "@/services/payment"
import { IRequestPaginationAndSearch } from "@/types/api"
import { IApprovePaymentRequest, ICreateOrUpdatePaymentRequest, IMarkPaymentPaidRequest, IRejectPaymentRequest, IUploadPaymentRequestFileRequest } from "@/types/payment"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { getApiErrorMessage } from '@/lib/api-error'


export const useGetPayments = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.PAYMENT],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllPayments(payload)
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
    })
}

export const useCancelPaymentRequest = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.CANCEL_PAYMENT_REQUEST],
        mutationFn: async (id: string) => {
            return await cancelPaymentRequest(id)
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
        onSuccess: () => {
            toast({
                title: "Đã hủy đề nghị thanh toán",
            })
        },
    })
}

export const useMarkPaymentPaid = () => {
    const { toast } = useToast()

    return useMutation({
        mutationKey: [QUERIES.MARK_PAYMENT_PAID],
        mutationFn: async ({ id, body }: { id: string; body: IMarkPaymentPaidRequest }) => {
            return await markPaymentPaid(id, body)
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
        onSuccess: () => {
            toast({
                title: "Đã ghi nhận thanh toán",
            })
        },
    })
}