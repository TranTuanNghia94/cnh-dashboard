import { QUERIES } from "@/lib/constants"
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "@/services/category"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { ICreateCategoryRequest, IUpdateCategoryRequest } from "@/types/category"


export const useGetCategories = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CATEGORY],
        mutationFn: async () => {
            return await getAllCategories()
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

export const useGetCategoryById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_CATEGORY],
        mutationFn: async (id: string) => {
            return await getCategoryById(id)
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

export const useCreateCategory = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_CATEGORY],
        mutationFn: async (payload: ICreateCategoryRequest) => {
            return await createCategory(payload)
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

export const useUpdateCategory = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_CATEGORY],
        mutationFn: async (payload: IUpdateCategoryRequest) => {
            return await updateCategory(payload)
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

export const useDeleteCategory = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.DELETE_CATEGORY],
        mutationFn: async (id: string) => {
            return await deleteCategory(id)
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