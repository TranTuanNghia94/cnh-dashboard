import { QUERIES } from "@/lib/constants"
import { deleteProduct, getAllProducts, getProductById, updateProduct } from "@/services/product"
import { createProduct } from "@/services/product"
import { IRequestPaginationAndSearch } from "@/types/api"
import { ICreateProductRequest, IUpdateProductRequest } from "@/types/product"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetProducts = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.PRODUCT],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllProducts(payload)
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

export const useCreateProduct = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_PRODUCT],
        mutationFn: async (payload: ICreateProductRequest) => {
            return await createProduct(payload)
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

export const useDeleteProduct = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.DELETE_PRODUCT],
        mutationFn: async (id: string) => {
            return await deleteProduct(id)
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

export const useGetProductById = () => { 
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_PRODUCT],
        mutationFn: async (id: string) => {
            return await getProductById(id)
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

export const useUpdateProduct = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_PRODUCT],
        mutationFn: async (payload: IUpdateProductRequest) => {
            return await updateProduct(payload)
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