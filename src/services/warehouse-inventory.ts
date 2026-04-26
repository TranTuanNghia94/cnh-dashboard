import { fetcherWithAuth, METHODS } from '@/lib/api';
import {
  URL_WAREHOUSE_INVENTORY_GET_BALANCE,
  URL_WAREHOUSE_INVENTORY_GET_TRANSACTIONS,
  URL_WAREHOUSE_INVENTORY_LIST,
} from '@/lib/url';
import { IRequestPaginationAndSearch } from '@/types/api';
import type {
  IWarehouseInventoryBalanceInfo,
  IWarehouseStockTransactionInfo,
} from '@/types/warehouse-inventory';

export const listWarehouseInventory = async (body: IRequestPaginationAndSearch) => {
  return await fetcherWithAuth<IWarehouseInventoryBalanceInfo[]>(URL_WAREHOUSE_INVENTORY_LIST, {
    method: METHODS.POST,
    data: body,
  });
};

export const getWarehouseInventoryBalance = async (productId: string) => {
  return await fetcherWithAuth<IWarehouseInventoryBalanceInfo>(
    URL_WAREHOUSE_INVENTORY_GET_BALANCE.replace('{productId}', productId),
    { method: METHODS.GET },
  );
};

export const listWarehouseStockTransactions = async (productId: string) => {
  return await fetcherWithAuth<IWarehouseStockTransactionInfo[]>(
    URL_WAREHOUSE_INVENTORY_GET_TRANSACTIONS.replace('{productId}', productId),
    { method: METHODS.GET },
  );
};
