
import { getInventoryOut } from "@/services/inventory-out";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { QUERIES } from "@/lib/constants";
import { IXuatKhoRequest, IXuatKhoWhere } from "@/types/inventory-out";
import { IPaginationAndSearch } from "@/types/api";

export const useGetInventoryOut = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.INVENTORY_OUT],
        mutationFn: async (payload?: IPaginationAndSearch<IXuatKhoWhere, unknown>) => {
            const request: IXuatKhoRequest = {
                where: {
                    ...payload?.search,
                },
                include: {
                    CreatedBy: true,
                    Kho: true,
                },
            }
            return await getInventoryOut(request)
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