
import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_GET_EXPORT_REQUEST } from "@/lib/url";
import { IXuatKhoRequest, IXuatKhoResponse } from "@/types/inventory-out";


export const getInventoryOut = async (body?: IXuatKhoRequest) => {
	const response = await fetcherWithAuth<IXuatKhoResponse>(URL_GET_EXPORT_REQUEST, {
		method: METHODS.POST,
		data: body,
	});

	return response;
};