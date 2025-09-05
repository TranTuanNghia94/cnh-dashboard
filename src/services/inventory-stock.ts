import { fetcherWithAuth, METHODS } from "@/lib/api";
import { URL_INVENTORY } from "@/lib/url";
import { IInventoryStockRequest, IInventoryStockResponse } from "@/types/inventory-stock";


export const getInventoryStock = async (body?: IInventoryStockRequest) => {
	const response = await fetcherWithAuth<IInventoryStockResponse>(URL_INVENTORY, {
		method: METHODS.POST,
		data: body,
	});

	return response;
};