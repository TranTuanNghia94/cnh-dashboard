import { QUERIES } from '@/lib/constants';
import {
  getWarehouseInventoryBalance,
  listWarehouseInventory,
  listWarehouseStockTransactions,
} from '@/services/warehouse-inventory';
import { IRequestPaginationAndSearch } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const useListWarehouseInventory = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INVENTORY_LIST],
    mutationFn: async (body: IRequestPaginationAndSearch) => await listWarehouseInventory(body),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useGetWarehouseInventoryBalance = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INVENTORY_BALANCE],
    mutationFn: async (productId: string) => await getWarehouseInventoryBalance(productId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};

export const useListWarehouseStockTransactions = () => {
  const { toast } = useToast();
  return useMutation({
    mutationKey: [QUERIES.WAREHOUSE_INVENTORY_TRANSACTIONS],
    mutationFn: async (productId: string) => await listWarehouseStockTransactions(productId),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra',
        description: error.message,
      });
    },
  });
};
