import { QUERIES } from "@/lib/constants"
import { createCustomer, deleteAddress, deleteCustomer, getAddressByCustomerId, getAllCustomers, updateAddress, updateCustomer } from "@/services/customer"
import { IPaginationAndSearch } from "@/types/api"
import { ICustomerAddressInput, ICustomerAddressRequest, ICustomerInput, ICustomerRequest, ICustomerWhere } from "@/types/customer"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"


export const useGetCustomers = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CUSTOMERS],
        mutationFn: async (payload?: IPaginationAndSearch<ICustomerWhere, unknown>) => {
            const request: ICustomerRequest = {
                include: {
                  LienHe_s: true  
                },
                ...payload,
            }

            if (payload?.orderBy) {
                request.orderBy = payload.orderBy
            }

            return await getAllCustomers(request)
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

export const useGetCustomerByCode = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_CUSTOMER],
        mutationFn: async (code: string) => {
            const request: ICustomerRequest = {
                where: {
                    maKhachHang: code
                },
                include: {
                    LienHe_s: true,
                }
            }
            return await getAllCustomers(request)
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
        mutationFn: async (payload?: ICustomerInput) => {
            const request: ICustomerRequest = {
                data: payload
            }

            return await createCustomer(request)
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
        mutationFn: async (payload?: ICustomerInput) => {
            const request: ICustomerRequest = {
                where: {
                    id: payload?.id
                },
                data: payload
            }

            return await updateCustomer(request)
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
            return await getAddressByCustomerId({ where: { id_KhachHang: id } })
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

export const useDeleteAddress = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_CUSTOMER],
        mutationFn: async (id: string) => {
            const request: ICustomerAddressRequest = {
                where: {
                    id: id
                }
            }

            return await deleteAddress(request)
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

export const useUpdateAddress = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.UPDATE_CUSTOMER],
        mutationFn: async (payload?: ICustomerAddressInput) => {
            const request: ICustomerAddressRequest = {
                where: {
                    id: payload?.id
                },
                data: payload
            }

            return await updateAddress(request)
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
        mutationKey: [QUERIES.UPDATE_CUSTOMER],
        mutationFn: async (id: string) => {
            const request: ICustomerRequest = {
                where: {
                    id
                }
            }

            return await deleteCustomer(request)
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