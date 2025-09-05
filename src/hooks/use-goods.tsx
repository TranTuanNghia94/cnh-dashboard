import { QUERIES } from "@/lib/constants"
import { createGoods, createManyGoods, deleteGoods, getAllGoods, updateGoods, validateGoods } from "@/services/goods"
import { IPaginationAndSearch } from "@/types/api"
import { IGoodsInput, IGoodsRequest, IGoodsValidate, IGoodsWhere } from "@/types/goods"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetGoods = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GOODS],
        mutationFn: async (payload?: IPaginationAndSearch<IGoodsWhere, unknown>) => {
            const request: IGoodsRequest = {
                include: {
                    LoaiHang: true
                },
                ...payload,
            }

            if (payload?.orderBy) {
                request.orderBy = payload.orderBy
            }

            return await getAllGoods(request)
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

export const useGetGoodsByCode = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_GOODS],
        mutationFn: async (code?: string) => {
            const request: IGoodsRequest = {
                include: {
                    LoaiHang: true
                },
                where: {
                    maHangHoa: code
                }
            }

            return await getAllGoods(request)
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

export const useCreateGoods = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_GROUP_OF_GOODS],
        mutationFn: async (payload?: IGoodsInput) => {
            const request: IGoodsRequest = {
                data: payload,
            }

            return await createGoods(request)
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

export const useUpdateGoods = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_GOODS],
        mutationFn: async (payload?: IGoodsInput) => {
            const request: IGoodsRequest = {
                data: payload,
                where: {
                    id: payload?.id
                }
            }

            return await updateGoods(request)
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

export const useDeleteGoods = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_GOODS],
        mutationFn: async (id: string) => {
            const request: IGoodsRequest = {
                where: {
                    id: id
                }
            }

            return await deleteGoods(request)
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

export const useValidateGoods = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_GOODS],
        mutationFn: async (payload: IGoodsValidate[]) => {
            return await validateGoods(payload)
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

export const useCreateManyGoods = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_GOODS],
        mutationFn: async (payload: IGoodsInput[]) => {
            const request: IGoodsRequest = {
                data: payload
            }

            return await createManyGoods(request)
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