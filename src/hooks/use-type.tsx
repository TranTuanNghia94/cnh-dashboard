import { QUERIES } from "@/lib/constants"
import { createType, deleteType, getAllTypes, updateType } from "@/services/type"
import { IPaginationAndSearch } from "@/types/api"
import { IGroupOfGoodsInput, IGroupOfGoodsRequest, IGroupOfGoodsWhere } from "@/types/type"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetTypes = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GROUP_OF_GOODS],
        mutationFn: async (payload?: IPaginationAndSearch<IGroupOfGoodsWhere, unknown>) => {
            const request: IGroupOfGoodsRequest = {
                ...payload,
            }

            if (payload?.orderBy) {
                request.orderBy = payload.orderBy
            }

            return await getAllTypes(request)
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

export const useGetTypeById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_GROUP_OF_GOODS],
        mutationFn: async (id: string) => {
            const request: IGroupOfGoodsRequest = {
                where: {
                    id
                }
            }
            return await getAllTypes(request)
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

export const useCreateType = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_GROUP_OF_GOODS],
        mutationFn: async (payload?: IGroupOfGoodsInput) => {
            const request: IGroupOfGoodsRequest = {
                data: payload,
            }

            return await createType(request)
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

export const useUpdateType = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_GROUP_OF_GOODS],
        mutationFn: async (payload?: IGroupOfGoodsInput) => {
            const request: IGroupOfGoodsRequest = {
                data: payload,
                where:{
                    id: payload?.id
                }
            }

            return await updateType(request)
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

export const useDeleteType = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_GROUP_OF_GOODS],
        mutationFn: async (id: string) => {
            const request: IGroupOfGoodsRequest = {
                where:{
                    id: id
                }
            }

            return await deleteType(request)
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