import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_GET_IMPORT_REQUEST } from "@/lib/url";
import { INhapKhoRequest, INhapKhoResponse } from "@/types/inventory-in";


export const getInventoryIn = async (body?: INhapKhoRequest) => {
	const response = await fetcherWithAuth<INhapKhoResponse>(URL_GET_IMPORT_REQUEST, {
		method: METHODS.POST,
		data: body,
	});

	return response;
};