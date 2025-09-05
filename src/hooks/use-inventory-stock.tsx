
import { getInventoryStock } from "@/services/inventory-stock";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { QUERIES } from "@/lib/constants";
import { IInventoryStockRequest, IInventoryStockWhere } from "@/types/inventory-stock";
import { IPaginationAndSearch } from "@/types/api";

export const useGetInventoryStock = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.INVENTORY_STOCK],
        mutationFn: async (payload?: IPaginationAndSearch<IInventoryStockWhere, unknown>) => {
            const request: IInventoryStockRequest = {
                where: {
                    soLuong: {
                        gt: 0
                    },
                    ...payload?.search,
                },
                include: {
                    HangHoa: {
                        include: {
                            LoaiHang: true
                        }
                    },
                    Kho: true,
                },
                orderBy: payload?.orderBy,
                take: payload?.take,
                skip: payload?.skip,
            }
            return await getInventoryStock(request)
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