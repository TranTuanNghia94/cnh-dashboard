
import { getInventoryIn } from "@/services/inventory-in";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { QUERIES } from "@/lib/constants";
import { INhapKhoRequest, INhapKhoWhere } from "@/types/inventory-in";
import { IPaginationAndSearch } from "@/types/api";

export const useGetInventoryIn = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.INVENTORY_IN],
        mutationFn: async (payload?: IPaginationAndSearch<INhapKhoWhere, unknown>) => {
            const request: INhapKhoRequest = {
                where: {
                    ...payload?.search,
                },
                include: {
                    CreatedBy: true,
                    DonHang: true,
                    NhaCungCap: true,
                    Kho: true,
                },
            }
            return await getInventoryIn(request)
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

export const useGetInventoryInDetail = () => {
    const { toast } = useToast()

    const mutation = useMutation({
        mutationKey: [QUERIES.INVENTORY_IN_DETAIL],
        mutationFn: async (code: string) => {
            const request: INhapKhoRequest = {
                where: {
                    soPhieuNhap: code,
                },
                include: {
                    Uploaded_ImportDocument: true,
                    ChiTietNhapKho: {
						include: {
							KhachHang: true,
							HangHoa: true,
							NhaCungCap: true,
							DonMuaHangChiTiet: true,
							DonHangChiTiet: {
								include: {
									DonHang: true,
								}
							}					
						},
					},
					Kho: true,
					CreatedBy: true,
					approvedBy: true,
					ChiPhi: true,
                },
            }
            return await getInventoryIn(request)
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