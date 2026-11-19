import { QUERIES } from "@/lib/constants"
import { createPurchaseOrder, deletePurchaseOrder, findPurchaseOrderLineByDocument, getAllPurchases, getPurchaseById, updatePurchaseOrder, updatePurchaseOrderStatus } from "@/services/purchase"
import { IRequestPaginationAndSearch } from "@/types/api"
import { IFindPurchaseOrderLineByDocumentRequest, IPurchaseCreateRequest } from "@/types/purchase"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { getApiErrorMessage } from '@/lib/api-error'


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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
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
                title: 'Không thành công',
                description: getApiErrorMessage(error),
            })
        },
    })

    return mutation
}


export const useFindPurchaseOrderLineByDocument = () => {
  const { toast } = useToast()

  const mutation = useMutation({
    mutationKey: [QUERIES.PURCHASES, 'FIND_BY_DOCUMENT'],
    mutationFn: async (payload: IFindPurchaseOrderLineByDocumentRequest) => {
      return await findPurchaseOrderLineByDocument(payload)
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

export const useDeletePurchaseOrder = () => {
  const { toast } = useToast()

  return useMutation({
    mutationKey: [QUERIES.DELETE_PURCHASE_ORDER],
    mutationFn: async (id: string) => await deletePurchaseOrder(id),
    onError(error: Error) {
      toast({
        variant: "destructive",
        title: 'Không thành công',
                description: getApiErrorMessage(error),
      })
    },
    onSuccess() {
      toast({
        title: "Đã xoá đơn mua hàng",
      })
    },
  })
}

export const useUpdatePurchaseOrderStatus = () => {
  const { toast } = useToast()

  return useMutation({
    mutationKey: [QUERIES.UPDATE_PURCHASE_ORDER_STATUS],
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      await updatePurchaseOrderStatus(id, status),
    onError(error: Error) {
      toast({
        variant: "destructive",
        title: 'Không thành công',
                description: getApiErrorMessage(error),
      })
    },
    onSuccess() {
      toast({
        title: "Đã cập nhật trạng thái đơn mua hàng",
      })
    },
  })
}
