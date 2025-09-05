import { QUERIES } from "@/lib/constants"
import { changePassword, getAllRoles, getAllUsers, getMe, getUserById } from "@/services/user"
import { createUser } from "@/services/user"
import { IRequestPaginationAndSearch } from "@/types/api"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "./use-toast"
import { ICreateUserInput } from "@/types/user"


export const useGetUsers = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.USERS],
        mutationFn: async (payload?: IRequestPaginationAndSearch) => {
            return await getAllUsers(payload)
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

export const useCreateUser = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CREATE_USER],
        mutationFn: async (payload: ICreateUserInput) => {
            return await createUser(payload)
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

export const useGetUserById = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.GET_USER_BY_ID],
        mutationFn: async (id: string) => {
            return await getUserById(id)
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

export const useGetMe = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.ME],
        mutationFn: async () => {
            return await getMe()
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

export const useChangePassword = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.CHANGE_PASSWORD],
        mutationFn: async (data: { oldPwd: string, newPwd: string }) => {
            return await changePassword(data)
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

export const useGetAllRoles = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.ALL_ROLES],
        mutationFn: async () => {
            return await getAllRoles()
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

// export const useDisableUser = () => {
//     const { toast } = useToast()

//     const mutation = useMutation({
//         mutationKey: [QUERIES.DISABLE_USER],
//         mutationFn: async (data: { username: string }) => {
//             const request: IUserRequest = {
//                 where: {
//                     username: data.username
//                 }
//             }

//             return await disableUser(request)
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

// export const useCreateUser = () => {
//     const { toast } = useToast()

//     const mutation = useMutation({
//         mutationKey: [QUERIES.CREATE_USER],
//         mutationFn: async (payload: IUserInput) => {
//             const request: IUserRequest = {
//                 data: payload
//             }

//             return await createUser(request)
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

// export const useUpdateUser = () => {
//     const { toast } = useToast()

//     const mutation = useMutation({
//         mutationKey: [QUERIES.UPDATE_USER],
//         mutationFn: async (payload: IUserUpdateInput) => {
//             const request: IUserRequest = {
//                 where: {
//                     id: payload.id as string
//                 },
//                 data: payload
//             }

//             return await updateUser(request)
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