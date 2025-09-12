import { QUERIES } from "@/lib/constants"
import { createCustomer, deleteCustomer, getAllCustomers, getAddressByCustomerId, getCustomerById, updateCustomer } from "@/services/customer"
import { IRequestPaginationAndSearch } from "@/types/api"
import { ICustomerRequestCreate, ICustomerRequestUpdate } from "@/types/customer"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetCustomers = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CUSTOMERS],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllCustomers(payload)
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

export const useGetCustomerById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_CUSTOMER],
        mutationFn: async (id: string) => {
            return await getCustomerById(id)
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

export const useCreateCustomer = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_CUSTOMER],
        mutationFn: async (payload: ICustomerRequestCreate) => {
            return await createCustomer(payload)
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

export const useDeleteCustomer = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.DELETE_CUSTOMER],
        mutationFn: async (id: string) => {
            return await deleteCustomer(id)
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

export const useUpdateCustomer = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_CUSTOMER],
        mutationFn: async (payload: ICustomerRequestUpdate) => {
            return await updateCustomer(payload)
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

export const useGetAddressByCustomerId = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_CUSTOMER_ADDRESS],
        mutationFn: async (id: string) => {
            return await getAddressByCustomerId(id)
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

// export const useDeleteAddress = () => {
//     const { toast } = useToast()

//     const mutation = useMutation({
//         mutationKey: [QUERIES.UPDATE_CUSTOMER],
//         mutationFn: async (id: string) => {
//             const request: ICustomerAddressRequest = {
//                 where: {
//                     id: id
//                 }
//             }

//             return await deleteAddress(request)
//         },
//         onError(error: Error) {
//             toast({
//                 variant: "destructive",
//                 title: "Có lỗi xảy ra",
//                 description: error.message,
//             })
//         },
//     })

//     return mutation
// }

// export const useUpdateAddress = () => {
//     const { toast } = useToast()

//     const mutation = useMutation({
//         mutationKey: [QUERIES.UPDATE_CUSTOMER],
//         mutationFn: async (payload?: ICustomerAddressInput) => {
//             const request: ICustomerAddressRequest = {
//                 where: {
//                     id: payload?.id
//                 },
//                 data: payload
//             }

//             return await updateAddress(request)
//         },
//         onError(error: Error) {
//             toast({
//                 variant: "destructive",
//                 title: "Có lỗi xảy ra",
//                 description: error.message,
//             })
//         },
//     })

//     return mutation
// }

